# Infinite Scrolling Pagination Guide for Python Developers

## Recommended Approach: Cursor-Based Pagination

### Overview
Cursor-based pagination uses an opaque token (cursor) that encodes the position in the dataset. This approach provides consistent performance and handles concurrent data modifications gracefully.

### Implementation

#### 1. Database Schema Requirements
```sql
-- Ensure composite index for efficient cursor queries
CREATE INDEX idx_events_cursor ON events(event_date DESC, id);

-- Optional: indexes for common filters
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_category ON events(event_category);
```

#### 2. Cursor Encoding/Decoding
```python
import base64
import json
from datetime import datetime
from typing import Optional, Dict, Any

class CursorPagination:
    @staticmethod
    def encode_cursor(event_date: datetime, event_id: str) -> str:
        """Create an opaque cursor from position data."""
        cursor_data = {
            "t": event_date.isoformat(),
            "id": event_id
        }
        cursor_json = json.dumps(cursor_data)
        cursor_bytes = cursor_json.encode('utf-8')
        return base64.urlsafe_b64encode(cursor_bytes).decode('utf-8')
    
    @staticmethod
    def decode_cursor(cursor: str) -> Dict[str, Any]:
        """Decode cursor back to position data."""
        try:
            cursor_bytes = base64.urlsafe_b64decode(cursor.encode('utf-8'))
            cursor_json = cursor_bytes.decode('utf-8')
            cursor_data = json.loads(cursor_json)
            # Parse the timestamp
            cursor_data['t'] = datetime.fromisoformat(cursor_data['t'])
            return cursor_data
        except (ValueError, KeyError, json.JSONDecodeError):
            raise ValueError("Invalid cursor")
```

#### 3. FastAPI Endpoint Implementation
```python
from fastapi import FastAPI, Query, HTTPException
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
import asyncpg

app = FastAPI()

class Event(BaseModel):
    id: str
    event_date: datetime
    event_category: str
    obligor: str
    trigger_type: str
    lifecycle_status: str
    # ... other fields

class PaginatedResponse(BaseModel):
    data: List[Event]
    next_cursor: Optional[str]
    has_more: bool
    total: Optional[int]  # Optional, expensive to calculate

@app.get("/events")
async def get_events(
    # Pagination params
    cursor: Optional[str] = Query(None, description="Pagination cursor"),
    limit: int = Query(50, ge=1, le=100, description="Items per page"),
    
    # Filter params
    status: Optional[str] = Query(None),
    event_category: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    
    # Database connection
    db: asyncpg.Connection = Depends(get_db)
) -> PaginatedResponse:
    """
    Fetch events with cursor-based pagination.
    
    The cursor encodes the position (event_date, id) of the last item
    from the previous page, allowing consistent pagination even with
    concurrent inserts/deletes.
    """
    
    # Build base query
    query_parts = []
    params = []
    param_count = 0
    
    # Add cursor condition if provided
    if cursor:
        try:
            cursor_data = CursorPagination.decode_cursor(cursor)
            query_parts.append(
                f"(event_date, id) < (${param_count + 1}, ${param_count + 2})"
            )
            params.extend([cursor_data['t'], cursor_data['id']])
            param_count += 2
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid cursor")
    
    # Add filters
    if status:
        param_count += 1
        query_parts.append(f"status = ${param_count}")
        params.append(status)
    
    if event_category:
        param_count += 1
        query_parts.append(f"event_category = ${param_count}")
        params.append(event_category)
    
    if start_date:
        param_count += 1
        query_parts.append(f"event_date >= ${param_count}")
        params.append(start_date)
    
    if end_date:
        param_count += 1
        query_parts.append(f"event_date <= ${param_count}")
        params.append(end_date)
    
    # Build WHERE clause
    where_clause = ""
    if query_parts:
        where_clause = "WHERE " + " AND ".join(query_parts)
    
    # Fetch data with limit + 1 to check if more data exists
    query = f"""
        SELECT 
            id, event_date, event_category, obligor, 
            trigger_type, lifecycle_status
        FROM events
        {where_clause}
        ORDER BY event_date DESC, id
        LIMIT ${param_count + 1}
    """
    params.append(limit + 1)
    
    # Execute query
    rows = await db.fetch(query, *params)
    
    # Process results
    has_more = len(rows) > limit
    events = [Event(**dict(row)) for row in rows[:limit]]
    
    # Generate next cursor if there's more data
    next_cursor = None
    if has_more and events:
        last_event = events[-1]
        next_cursor = CursorPagination.encode_cursor(
            last_event.event_date, 
            last_event.id
        )
    
    return PaginatedResponse(
        data=events,
        next_cursor=next_cursor,
        has_more=has_more
    )
```

#### 4. SQLAlchemy Implementation
```python
from sqlalchemy import select, and_, tuple_
from sqlalchemy.orm import Session

class EventRepository:
    def __init__(self, session: Session):
        self.session = session
    
    def get_paginated_events(
        self,
        cursor: Optional[str] = None,
        limit: int = 50,
        filters: Dict[str, Any] = None
    ) -> PaginatedResponse:
        """Fetch events with cursor pagination using SQLAlchemy."""
        
        query = select(EventModel).order_by(
            EventModel.event_date.desc(),
            EventModel.id
        )
        
        # Apply cursor filter
        if cursor:
            cursor_data = CursorPagination.decode_cursor(cursor)
            query = query.where(
                tuple_(EventModel.event_date, EventModel.id) < 
                tuple_(cursor_data['t'], cursor_data['id'])
            )
        
        # Apply other filters
        if filters:
            if filters.get('status'):
                query = query.where(EventModel.status == filters['status'])
            if filters.get('event_category'):
                query = query.where(
                    EventModel.event_category == filters['event_category']
                )
            # ... more filters
        
        # Fetch limit + 1 to check for more data
        results = self.session.execute(
            query.limit(limit + 1)
        ).scalars().all()
        
        has_more = len(results) > limit
        events = results[:limit]
        
        # Generate next cursor
        next_cursor = None
        if has_more and events:
            last_event = events[-1]
            next_cursor = CursorPagination.encode_cursor(
                last_event.event_date,
                last_event.id
            )
        
        return PaginatedResponse(
            data=[Event.from_orm(e) for e in events],
            next_cursor=next_cursor,
            has_more=has_more
        )
```

#### 5. Django Implementation
```python
from django.db import models
from django.http import JsonResponse
from django.views import View
import json

class EventView(View):
    def get(self, request):
        cursor = request.GET.get('cursor')
        limit = min(int(request.GET.get('limit', 50)), 100)
        
        # Base queryset
        queryset = Event.objects.all().order_by('-event_date', 'id')
        
        # Apply cursor filter
        if cursor:
            try:
                cursor_data = CursorPagination.decode_cursor(cursor)
                queryset = queryset.filter(
                    models.Q(event_date__lt=cursor_data['t']) |
                    models.Q(
                        event_date=cursor_data['t'],
                        id__gt=cursor_data['id']
                    )
                )
            except ValueError:
                return JsonResponse({'error': 'Invalid cursor'}, status=400)
        
        # Apply filters
        if status := request.GET.get('status'):
            queryset = queryset.filter(status=status)
        
        # Fetch data
        events = list(queryset[:limit + 1])
        has_more = len(events) > limit
        events = events[:limit]
        
        # Generate response
        next_cursor = None
        if has_more and events:
            last_event = events[-1]
            next_cursor = CursorPagination.encode_cursor(
                last_event.event_date,
                last_event.id
            )
        
        return JsonResponse({
            'data': [event.to_dict() for event in events],
            'next_cursor': next_cursor,
            'has_more': has_more
        })
```

### Testing Cursor Pagination

```python
import pytest
from datetime import datetime, timedelta
import asyncio

@pytest.mark.asyncio
async def test_cursor_pagination():
    """Test cursor pagination handles concurrent inserts correctly."""
    
    # Initial fetch
    response1 = await get_events(limit=10)
    assert len(response1.data) == 10
    assert response1.has_more is True
    
    # Simulate concurrent insert of new events
    await insert_events(5)  # Add 5 new events
    
    # Fetch next page using cursor - should not see duplicates
    response2 = await get_events(
        cursor=response1.next_cursor,
        limit=10
    )
    
    # Verify no duplicate IDs between pages
    ids_page1 = {e.id for e in response1.data}
    ids_page2 = {e.id for e in response2.data}
    assert len(ids_page1.intersection(ids_page2)) == 0

@pytest.mark.asyncio
async def test_cursor_with_filters():
    """Test cursor pagination with filters applied."""
    
    response = await get_events(
        limit=20,
        status="pending",
        event_category="Mandatory"
    )
    
    # All results should match filters
    for event in response.data:
        assert event.status == "pending"
        assert event.event_category == "Mandatory"
```

---

## Alternative Approach: Offset-Based Pagination (Not Recommended)

### Implementation
```python
@app.get("/events")
async def get_events_offset(
    offset: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(50, ge=1, le=100, description="Items per page"),
    status: Optional[str] = Query(None),
    db: asyncpg.Connection = Depends(get_db)
) -> Dict:
    """
    Simple offset-based pagination.
    WARNING: This approach has several issues at scale.
    """
    
    # Count total (expensive!)
    count_query = "SELECT COUNT(*) FROM events WHERE ($1::text IS NULL OR status = $1)"
    total = await db.fetchval(count_query, status)
    
    # Fetch page
    query = """
        SELECT * FROM events
        WHERE ($1::text IS NULL OR status = $1)
        ORDER BY event_date DESC, id
        LIMIT $2 OFFSET $3
    """
    
    rows = await db.fetch(query, status, limit, offset)
    events = [Event(**dict(row)) for row in rows]
    
    return {
        "data": events,
        "total": total,
        "offset": offset,
        "limit": limit,
        "has_more": offset + limit < total
    }
```

### Problems with Offset-Based Pagination

#### 1. Performance Degradation
```python
# Page 1 (offset=0): Fast
SELECT * FROM events ORDER BY event_date DESC LIMIT 50 OFFSET 0;
# Execution time: 5ms

# Page 100 (offset=5000): Slow
SELECT * FROM events ORDER BY event_date DESC LIMIT 50 OFFSET 5000;
# Execution time: 250ms (database must scan and skip 5000 rows!)

# Page 1000 (offset=50000): Very slow
SELECT * FROM events ORDER BY event_date DESC LIMIT 50 OFFSET 50000;
# Execution time: 2500ms
```

#### 2. Data Consistency Issues
```python
# Scenario: User is browsing page 2 (offset=50)
page_2_results = get_events(offset=50, limit=50)  # IDs: 51-100

# Meanwhile, 5 new events are inserted at the beginning
insert_new_events(5)

# User loads page 3 (offset=100)
page_3_results = get_events(offset=100, limit=50)  
# Expected IDs: 101-150
# Actual IDs: 96-145 (user sees events 96-100 twice!)
```

#### 3. Unreliable for Real-Time Data
```python
def demonstrate_offset_problem():
    """Show how offset pagination fails with concurrent modifications."""
    
    # User starts browsing
    page1 = fetch_page(offset=0, limit=10)   # Events 1-10
    
    # New event inserted while user reads
    insert_event("NEW_EVENT")  # Becomes event #1, pushes others down
    
    # User goes to page 2
    page2 = fetch_page(offset=10, limit=10)  
    # User expects: Events 11-20
    # User gets: Original events 10-19 (event 10 shown twice!)
    
    # If events are deleted, users might skip data entirely
    delete_events([1, 2, 3])
    page3 = fetch_page(offset=20, limit=10)
    # User misses 3 events that shifted positions
```

#### 4. Memory and CPU Issues
```python
# Offset requires maintaining result set order in memory
# For OFFSET 10000, database must:
# 1. Fetch and sort 10,050 rows
# 2. Discard first 10,000 rows
# 3. Return remaining 50 rows

# This causes:
# - High memory usage (holding 10,000 rows temporarily)
# - CPU waste (sorting rows that will be discarded)
# - I/O waste (reading data that won't be returned)
```

#### 5. Poor UX for Deep Pagination
```python
# Users can't bookmark positions reliably
user_bookmarks_page_100 = "?offset=5000&limit=50"

# Tomorrow, with new data added:
# - Same URL shows completely different events
# - User's position in the list is lost
# - Can't reliably return to where they left off
```

### Performance Comparison

```python
import time
import asyncio

async def benchmark_pagination():
    """Compare cursor vs offset performance."""
    
    results = []
    
    # Test different depths
    for position in [0, 1000, 5000, 10000, 20000]:
        # Offset-based
        start = time.time()
        await get_events_offset(offset=position, limit=50)
        offset_time = time.time() - start
        
        # Cursor-based (simulate cursor at same position)
        cursor = generate_cursor_at_position(position)
        start = time.time()
        await get_events(cursor=cursor, limit=50)
        cursor_time = time.time() - start
        
        results.append({
            'position': position,
            'offset_ms': offset_time * 1000,
            'cursor_ms': cursor_time * 1000,
            'speedup': offset_time / cursor_time
        })
    
    return results

# Typical results:
# Position 0:     Offset: 5ms,    Cursor: 5ms,    Speedup: 1x
# Position 1000:  Offset: 50ms,   Cursor: 5ms,    Speedup: 10x
# Position 5000:  Offset: 250ms,  Cursor: 5ms,    Speedup: 50x
# Position 10000: Offset: 500ms,  Cursor: 5ms,    Speedup: 100x
# Position 20000: Offset: 1000ms, Cursor: 5ms,    Speedup: 200x
```

## Recommendations

### Use Cursor-Based Pagination When:
- Dataset is large (>1000 records)
- Data changes frequently (inserts/deletes)
- Users need to scroll deep into results
- Consistent performance is critical
- Working with time-series or append-only data

### Consider Offset-Based Only When:
- Dataset is small and static (<100 records)
- Data rarely changes
- Users never paginate beyond first few pages
- You need page numbers in the UI
- Implementing a simple proof-of-concept

### Hybrid Approach
For the best of both worlds, implement cursor-based pagination in the backend but provide a UI that feels like traditional pagination:

```python
class HybridPagination:
    """
    Use cursors internally but present page numbers to users.
    Cache cursor positions for common page boundaries.
    """
    
    def __init__(self):
        self.page_cursors = {}  # Cache: page_num -> cursor
    
    async def get_page(self, page_num: int, limit: int = 50):
        # For page 1, no cursor needed
        if page_num == 1:
            return await get_events(limit=limit)
        
        # Check cache for page cursor
        if page_num in self.page_cursors:
            cursor = self.page_cursors[page_num]
            return await get_events(cursor=cursor, limit=limit)
        
        # Build up from last known position
        last_known_page = max(
            p for p in self.page_cursors.keys() 
            if p < page_num
        ) if self.page_cursors else 1
        
        # Fetch intermediate pages to build cursor chain
        cursor = self.page_cursors.get(last_known_page)
        for p in range(last_known_page, page_num):
            response = await get_events(cursor=cursor, limit=limit)
            cursor = response.next_cursor
            self.page_cursors[p + 1] = cursor
        
        return response
```

## Conclusion

While offset-based pagination seems simpler initially, cursor-based pagination provides superior performance, consistency, and user experience for production applications. The small additional implementation complexity pays significant dividends in reliability and scalability.