import React from 'react';
import { Club } from '@/app/types/Club';
import { Flex, useTheme } from '@chakra-ui/react';
import Profile from './quickStats';
import { Box } from '@chakra-ui/react';
import bgImage from '@/public/tempBGImage.jpg'

interface ClubPageProps {
  club: Club | null;
}

const ClubPage: React.FC<ClubPageProps> = ({ club }) => {
  const theme = useTheme();
  const bgGradient = `linear-gradient(
    rgba(${theme.colors.blackAlpha[800]}, 0.8),
    rgba(${theme.colors.blackAlpha[800]}, 0.8)
  ), url(${bgImage.src})`;

  return (
    <div className="club-page">
      <section className="header">
        <Box minHeight={'10rem'} maxH={'20rem'} width={'100vw'} sx={{
          bgGradient: [`radial(circle, blackAlpha.800, #FAF9F6), url(${bgImage.src})`, `linear(to-b, blackAlpha.800, #FAF9F6), url(${bgImage.src})`],
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
        <Flex className="quick-stats" justifyContent="center" width="100%">
          <Box p={10} m={10} shadow={'md'} width={'60vw'} borderRadius={'lg'}>
            <Profile profilePicture={club?.picturePath || ''} displayName={club?.displayName || ''} />
          </Box>
        </Flex>
      </Box>
      </section>

      <section className="upcoming-events">
        <h2>Upcoming Events</h2>
        {/* Add event list component here */}
      </section>

      <section className="photo-gallery">
        <h2>Photo Gallery</h2>
        {/* Add photo gallery component here */}
      </section>

      <section className="testimonials">
        <h2>Member Testimonials</h2>
        {/* Add testimonials component here */}
      </section>

      <section className="join-contact">
        <h2>Join Our Club</h2>
        {/* Add join information and contact form here */}
      </section>

      <section className="related-clubs">
        <h2>Related Clubs</h2>
        {/* Add related clubs component here */}
      </section>
    </div>
  );
};

export default ClubPage;