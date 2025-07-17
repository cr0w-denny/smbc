import { AppletMount, useHashNavigation } from '@smbc/applet-core';

interface AppletMenuProps {
  /** Array of applet configurations */
  applets: AppletMount[];
  /** Custom styling */
  className?: string;
  /** Render as horizontal menu (default: vertical) */
  horizontal?: boolean;
}

/**
 * Basic navigation menu component for installed applets
 * Provides minimal navigation between configured applets
 */
export function AppletMenu({ 
  applets, 
  className = '',
  horizontal = false 
}: AppletMenuProps) {
  const { currentPath, navigateTo } = useHashNavigation();
  const menuStyle = horizontal 
    ? { display: 'flex', gap: '1rem', listStyle: 'none', padding: 0, margin: 0 }
    : { listStyle: 'none', padding: 0, margin: 0 };

  const itemStyle = {
    marginBottom: horizontal ? 0 : '0.5rem'
  };

  const linkStyle = (isActive: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    textDecoration: 'none',
    color: isActive ? '#1976d2' : '#333',
    backgroundColor: isActive ? '#e3f2fd' : 'transparent',
    borderRadius: '4px',
    border: '1px solid transparent',
    transition: 'all 0.2s ease',
    fontSize: '0.875rem',
    fontWeight: isActive ? '600' : '400',
    ...(isActive ? {} : {
      ':hover': {
        backgroundColor: '#f5f5f5',
        borderColor: '#ddd'
      }
    })
  });

  return (
    <nav className={className}>
      <ul style={menuStyle}>
        {applets.map((applet) => {
          // Use the first route as the primary route for navigation
          const primaryRoute = applet.routes[0];
          if (!primaryRoute) return null;
          
          const isActive = currentPath === primaryRoute.path;
          
          return (
            <li key={applet.id} style={itemStyle}>
              <a 
                href={`#${primaryRoute.path}`}
                style={linkStyle(isActive)}
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo(primaryRoute.path);
                }}
              >
                {primaryRoute.icon && (
                  <span role="img" aria-label={applet.label}>
                    {typeof primaryRoute.icon === 'string' ? primaryRoute.icon : '📱'}
                  </span>
                )}
                <span>{applet.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

