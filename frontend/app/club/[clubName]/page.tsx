"use client"
import ClubPage from '@/app/ui/clubProfile/clubPage'
import { fetchClubByName } from '@/app/lib/backendAPI'
import { Text } from '@chakra-ui/react'
import { Club } from '@/app/types/Club'
import { useEffect, useState } from 'react'

export default function ClubDetailPage({ params }: { params: { clubName: string } }) {
    
  const [club, setClub] = useState<Club | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchClub = async () => {
      try {
        const clubData = await fetchClubByName(params.clubName);
        setClub(clubData);
      } catch (error) {
        console.error("Error fetching club:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClub();
  }, [params.clubName]);

  //const router = useRouter();


  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!club) {
    //router.push('/');
  }
  if( !isLoading && club ){
  return <ClubPage club={club} />
  }
}