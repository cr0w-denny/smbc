/**
 * Helper function to create a bulk delete action
 */
export function createBulkDeleteAction(deleteAPI, options) {
    return {
        type: "bulk",
        key: options?.key || "delete-selected",
        label: options?.label || "Delete Selected",
        icon: options?.icon,
        color: "error",
        onClick: async (items, context) => {
            console.log('BulkDeleteHelper: Starting bulk delete operation', {
                itemCount: items.length,
                itemIds: items.map(i => i.id),
                hasTransactionOperation: !!context?.addTransactionOperation,
                hasDeleteMutation: !!context?.deleteMutation,
                contextKeys: context ? Object.keys(context) : []
            });
            if (context?.addTransactionOperation) {
                console.log('BulkDeleteHelper: Using transaction system for bulk delete');
                // Use transaction system - this handles pending states correctly
                for (const item of items) {
                    console.log('BulkDeleteHelper: Adding transaction operation for item', item.id);
                    context.addTransactionOperation("delete", item, async () => {
                        console.log('BulkDeleteHelper: Transaction mutation executing for item', item.id);
                        // Use the framework's delete mutation instead of direct API call
                        // This ensures proper integration with the transaction system
                        if (context.deleteMutation) {
                            console.log('BulkDeleteHelper: Calling deleteMutation.mutateAsync for item', item.id);
                            await context.deleteMutation.mutateAsync({
                                params: { path: { id: item.id } },
                            });
                            console.log('BulkDeleteHelper: deleteMutation.mutateAsync completed for item', item.id);
                        }
                        else {
                            console.log('BulkDeleteHelper: No deleteMutation, falling back to direct API for item', item.id);
                            // Fallback to direct API call if mutation not available
                            await deleteAPI(item.id);
                        }
                        console.log('BulkDeleteHelper: Transaction mutation function completed for item', item.id);
                        return {};
                    }, "bulk-action");
                }
                console.log('BulkDeleteHelper: All transaction operations added');
            }
            else {
                console.log('BulkDeleteHelper: No transaction support, using direct API calls');
                // No transaction support, use direct API calls
                for (const item of items) {
                    console.log('BulkDeleteHelper: Direct API call for item', item.id);
                    await deleteAPI(item.id);
                }
            }
            console.log('BulkDeleteHelper: Bulk delete operation completed');
        },
    };
}
/**
 * Helper function to create a bulk update action
 */
export function createBulkUpdateAction(updateAPI, updateData, options) {
    return {
        type: "bulk",
        key: options?.key || `update-${Object.keys(updateData)[0]}`,
        label: options?.label || "Update Selected",
        icon: options?.icon,
        color: options?.color || "primary",
        onClick: async (items, context) => {
            if (context?.addTransactionOperation) {
                for (const item of items) {
                    // Create a minimal entity with just the ID and the fields being updated
                    const partialUpdate = {
                        id: item.id,
                        ...updateData
                    };
                    context.addTransactionOperation("update", partialUpdate, () => {
                        console.log('BulkUpdateHelper: mutation executing', {
                            itemId: item.id,
                            updateData,
                            partialUpdate
                        });
                        // Get the accumulated pending data at execution time
                        const accumulatedData = context?.getPendingData?.(item.id);
                        const dataToApply = accumulatedData || updateData;
                        console.log('BulkUpdateHelper: applying accumulated data', {
                            itemId: item.id,
                            originalUpdateData: updateData,
                            accumulatedData,
                            dataToApply
                        });
                        const result = updateAPI(item.id, dataToApply);
                        console.log('BulkUpdateHelper: mutation result', result);
                        return result;
                    }, "bulk-action", Object.keys(updateData));
                }
            }
        },
    };
}
/**
 * Helper function to create a row update action
 */
export function createRowUpdateAction(updateAPI, getUpdateData, options) {
    return {
        type: "row",
        key: options.key,
        label: options.label,
        icon: options.icon,
        color: options.color || "primary",
        disabled: options.disabled,
        hidden: options.hidden,
        onClick: async (item, context) => {
            if (context?.addTransactionOperation) {
                const updateData = getUpdateData(item);
                const updatedItem = { ...item, ...updateData };
                context.addTransactionOperation("update", updatedItem, () => updateAPI(item.id, updateData), "row-action", Object.keys(updateData));
            }
        },
    };
}
/**
 * Helper function to create a row delete action
 */
export function createRowDeleteAction(deleteAPI, options) {
    return {
        type: "row",
        key: options?.key || "delete",
        label: options?.label || "Delete",
        icon: options?.icon,
        color: "error",
        disabled: options?.disabled,
        hidden: options?.hidden,
        onClick: async (item, context) => {
            if (context?.addTransactionOperation) {
                context.addTransactionOperation("delete", item, async () => {
                    await deleteAPI(item.id);
                    return {};
                }, "row-action");
            }
        },
    };
}
/**
 * Helper function to create a toggle status action
 */
export function createToggleStatusAction(updateAPI, statusField, statusValues, // [activeValue, inactiveValue]
options) {
    return {
        type: "row",
        key: options.key,
        label: options.label,
        icon: options.icon,
        color: "primary",
        disabled: options.disabled,
        hidden: options.hidden,
        onClick: async (item, context) => {
            if (context?.addTransactionOperation) {
                const currentValue = item[statusField];
                const newValue = currentValue === statusValues[0] ? statusValues[1] : statusValues[0];
                const updateData = { [statusField]: newValue };
                const updatedItem = { ...item, ...updateData };
                context.addTransactionOperation("update", updatedItem, () => updateAPI(item.id, updateData), "row-action", [statusField]);
            }
        },
    };
}
