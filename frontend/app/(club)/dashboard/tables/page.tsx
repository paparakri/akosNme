// app/(club)/dashboard/tables/page.tsx
"use client";

import LayoutManager from '@/app/ui/seatingLayout/layoutManager';
import { getCurrentUser } from '@/app/lib/userStatus';
import { useEffect, useState } from 'react';

export default function TablesPage() {
  const [clubId, setClubId] = useState(null);

  useEffect(() => {
    const init = async () => {
      const club = await getCurrentUser();
      setClubId(club._id);
    };
    init();
  }, []);

  if (!clubId) return null;

  return (
    <LayoutManager 
      id={clubId} 
      onSave={() => console.log("Saving Not Yet Implemented")}
    />
  );
}