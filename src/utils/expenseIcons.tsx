
import { ReactElement } from 'react';
import { Wheat, Carrot, LeafyGreen, Tractor, PiggyBank } from 'lucide-react';

export const getCategoryIcon = (category: string): ReactElement => {
  switch(category.toLowerCase()) {
    case 'feed':
      return <Wheat className="h-4 w-4 text-farm-600" />;
    case 'medicine':
      return <LeafyGreen className="h-4 w-4 text-red-500" />;
    case 'equipment':
      return <Tractor className="h-4 w-4 text-amber-600" />;
    case 'labor':
      return <PiggyBank className="h-4 w-4 text-blue-500" />;
    default:
      return <Carrot className="h-4 w-4 text-green-500" />;
  }
};
