import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const destination = searchParams.get('destination');
  const budget = searchParams.get('budget');

  // Mock data - in a real application, you'd fetch this from a database or external API
  const accommodations = [
    { id: 1, name: 'Hotel Paradise', price: 150, tags: ['luxury', 'pool', 'spa'] },
    { id: 2, name: 'Budget Inn', price: 50, tags: ['budget', 'free-wifi'] },
    { id: 3, name: 'Mountain View B&B', price: 75, tags: ['cozy', 'great-views'] },
    { id: 4, name: 'City Center Hostel', price: 25, tags: ['social', 'shared-dorm'] },
    { id: 5, name: 'Seaside Resort', price: 200, tags: ['beachfront', 'all-inclusive'] },
  ];

  // Filter based on destination and budget if provided
  let filteredAccommodations = accommodations;
  if (budget) {
    filteredAccommodations = accommodations.filter(a => a.price <= parseInt(budget, 10));
  }

  // In a real app, you'd also filter by destination
  // For now, we return the top 5 or fewer if filtered
  const response = filteredAccommodations.slice(0, 5);

  return NextResponse.json(response);
}
