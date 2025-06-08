const handleBulkStatusChange = async (selectedIds: string[], status: 'active' | 'deceased') => {
  try {
    const updates = selectedIds.map(id => ({
      id,
      status,
      updatedAt: new Date().toISOString()
    }));

    await updateAnimals(updates);
    toast({
      title: "Status Updated",
      description: `Successfully marked ${selectedIds.length} animal${selectedIds.length > 1 ? 's' : ''} as ${status}.`,
    });
    setSelectedRows(new Set());
  } catch (error) {
    console.error('Error updating animal status:', error);
    toast({
      title: "Error",
      description: "Failed to update animal status. Please try again.",
      variant: "destructive",
    });
  }
}; 