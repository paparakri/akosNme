import React from 'react';
import {
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Heading,
  Text,
} from '@chakra-ui/react';

const faqs = [
    {
      question: 'How do I reserve a table at a club?',
      answer:
        `To reserve a table, simply visit the profile page of the club you're interested in and click the "Reserve a Table" button. This will open a reservation modal where you can select your desired date, time, and number of guests.`,
    },
    {
      question: 'What are the benefits of becoming a club owner on this platform?',
      answer:
        'As a club owner, you can create a profile for your establishment and manage your reservations through our intuitive dashboard. This helps you reach a wider audience and streamline your table booking process.',
    },
    {
      question: 'How do I cancel or modify a reservation?',
      answer:
        'You can cancel or modify your reservation by logging into your account and accessing the "My Reservations" section. From there, you can make the necessary changes or cancel the reservation altogether.',
    },
    {
      question: 'Do you offer any premium or VIP services?',
      answer:
        'Yes, we do offer premium and VIP services for clubs and customers. These include priority reservations, access to exclusive areas, and special amenities. You can learn more about our VIP offerings on the club profile pages.',
    },
  ];

export default function FaqPage() {
    return (
        <Box width="container.md">
        
        <Heading as="h1" size="2xl" color="orange">
            Frequently Asked Questions
        </Heading>

        <Box p={30}></Box>

        <Accordion allowMultiple>
        
            {faqs.map(faq => (
            <AccordionItem key={faq.question}>
            
                <AccordionButton>
                <Box textAlign="left" color="orange">
                    {faq.question}  
                </Box>
                </AccordionButton>
            
                <AccordionPanel pb={4}>
                <Text>
                    {faq.answer}  
                </Text>
                </AccordionPanel>
            
            </AccordionItem>
            ))}

        </Accordion>

        <Box p={30}></Box>

        </Box>
    )
}