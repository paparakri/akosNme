export function sortEventsByType(events) {
    return events.reduce((sortedEvents, event) => {
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
        sortedEvents[key].sort((a, b) => new Date(a.date) - new Date(b.date));
      });
  
      return sortedEvents;
    }, {});
}