import { render, screen, fireEvent } from '@testing-library/react';
import LocationsPage from '../page';

// Mock the useDestinations hook
jest.mock('@/lib/hooks/useDestinations', () => ({
  useDestinations: () => ({
    destinations: [
      { id: '1', name: 'Destination 1', city: 'City 1', state: 'State 1', image_url: '' },
      { id: '2', name: 'Destination 2', city: 'City 2', state: 'State 2', image_url: '' },
    ],
    isLoading: false,
    isLoadingMore: false,
    hasMore: false,
    loadMore: jest.fn(),
  }),
}));

// Mock the useTrips hook
jest.mock('@/lib/hooks/useTrips', () => ({
  useTrips: () => ({
    activeTrip: null,
    isLoading: false,
    isAuthenticated: false,
    createTrip: jest.fn(),
    updateTrip: jest.fn(),
    error: null,
  }),
}));

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('LocationsPage', () => {
  it('renders the page and destinations', () => {
    render(<LocationsPage />);

    expect(screen.getByText('Explore Incredible India')).toBeInTheDocument();
    expect(screen.getByText('Destination 1')).toBeInTheDocument();
    expect(screen.getByText('Destination 2')).toBeInTheDocument();
  });

  it('adds a destination to the trip when "Add to Trip" is clicked', () => {
    render(<LocationsPage />);

    const addToTripButtons = screen.getAllByText('Add to Trip');
    fireEvent.click(addToTripButtons[0]);

    expect(screen.getByText('Trip Planner (1)')).toBeInTheDocument();
  });

  it('navigates to the trip planning page when "Continue to Trip Planning" is clicked', () => {
    const { getByText, getAllByText } = render(<LocationsPage />);
    const mockRouter = require('next/navigation').useRouter();

    const addToTripButtons = getAllByText('Add to Trip');
    fireEvent.click(addToTripButtons[0]);

    const continueButton = getByText('Continue to Trip Planning');
    fireEvent.click(continueButton);

    expect(mockRouter.push).toHaveBeenCalledWith('/trip-planning');
  });
});
