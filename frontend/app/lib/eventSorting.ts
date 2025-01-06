export function sortEventsByType(events: any[]) {
    return events.reduce((sortedEvents: { [x: string]: any[]; featured?: any; today?: any; weekend?: any; concerts?: any; exclusive?: any; }, event: { date?: any; eventType: any; price?: any; }) => {
      const { eventType } = event;
  
      if (!sortedEvents.featured && !sortedEvents.today && !sortedEvents.weekend && !sortedEvents.concerts && !sortedEvents.exclusive) {
        sortedEvents.featured = [];
        sortedEvents.today = [];
        sortedEvents.weekend = [];
        sortedEvents.concerts = [];
        sortedEvents.exclusive = [];
      }
  
      sortedEvents[new Date(event.date).toISOString().split('T')[0] === new Date().toISOString().split('T')[0] ? 'today' : 
       new Date(event.date).getDay() === 5 || new Date(event.date).getDay() === 6 ? 'weekend' : 
       event.eventType === 'concert' ? 'concerts' : 
       event.price >= 100 ? 'exclusive' : 
       'featured'].push(event);
  
      // Sort the sublists according to date, from most recent to most far away in the future
      Object.keys(sortedEvents).forEach(key => {
        sortedEvents[key].sort((a: { date: string | number | Date; }, b: { date: string | number | Date; }) => new Date(b.date).getTime() - new Date(a.date).getTime());
      });
  
      return sortedEvents;
    }, {});
}