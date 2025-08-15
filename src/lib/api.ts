// API utility functions
// Types for API responses
export interface Route {
  id: string;
  agency: string;
  agencyLogoUrl: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  availableSeats: number;
  scheduleId: number;
  busId: number;
  routeId: number | null;
}

export interface Booking {
  id: number;
  seatNumber: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  schedule: {
    id: number;
    departure: string;
    arrival: string;
    price: number;
    bus: {
      plateNumber: string;
      company: {
        name: string;
        logoUrl?: string;
      };
    };
    route?: {
      origin: string;
      destination: string;
    };
  };
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiCall<T = unknown>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const { headers = {}, ...restOptions } = options;
  
  try {
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      ...restOptions,
    });

    // Handle non-JSON responses
    let data;
    try {
      data = await response.json();
    } catch {
      if (!response.ok) {
        throw new ApiError(response.status, `HTTP ${response.status}: ${response.statusText}`);
      }
      data = null;
    }

    if (!response.ok) {
      throw new ApiError(
        response.status, 
        data?.error || data?.message || `HTTP ${response.status}: ${response.statusText}`, 
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Handle network errors, etc.
    throw new ApiError(0, error instanceof Error ? error.message : 'Network error occurred');
  }
}

// Specific API functions
export const api = {
  // Search routes
  searchRoutes: async (searchParams: {
    departure: string;
    arrival: string;
    travelDate: string;
    passengers: number;
  }): Promise<Route[]> => {
    const queryParams = new URLSearchParams({
      departure: searchParams.departure,
      arrival: searchParams.arrival,
      travelDate: searchParams.travelDate,
      passengers: searchParams.passengers.toString(),
    });
    
    return apiCall<Route[]>(`/api/routes/search?${queryParams}`);
  },

  // Create booking
  createBooking: async (bookingData: {
    scheduleId: number;
    seatNumber: string;
    paymentMethod: 'mtn_mobile_money' | 'credit_card';
    paymentDetails: {
      phoneNumber?: string;
      cardNumber?: string;
      expiryDate?: string;
      cvv?: string;
    };
  }): Promise<Booking> => {
    return apiCall<Booking>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  // Get user bookings
  getUserBookings: async (): Promise<Booking[]> => {
    return apiCall<Booking[]>('/api/bookings');
  },

  // Register user
  registerUser: async (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<{ id: number; email: string; name: string }> => {
    return apiCall<{ id: number; email: string; name: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Admin APIs
  admin: {
    // Get all schedules
    getSchedules: async () => {
      return apiCall('/api/admin/schedules');
    },

    // Create schedule
    createSchedule: async (scheduleData: {
      departure: string;
      arrival: string;
      price: number;
      availableSeats: number;
      busId: number;
      routeId: number;
    }) => {
      return apiCall('/api/schedules', {
        method: 'POST',
        body: JSON.stringify(scheduleData),
      });
    },

    // Get companies
    getCompanies: async () => {
      return apiCall('/api/admin/companies');
    },

    // Create company
    createCompany: async (companyData: {
      name: string;
      logoUrl?: string;
      contact: string;
      description?: string;
    }) => {
      return apiCall('/api/admin/companies', {
        method: 'POST',
        body: JSON.stringify(companyData),
      });
    },

    // Get buses
    getBuses: async (companyId?: number) => {
      const queryParams = companyId ? `?companyId=${companyId}` : '';
      return apiCall(`/api/admin/buses${queryParams}`);
    },

    // Create bus
    createBus: async (busData: {
      plateNumber: string;
      capacity: number;
      model?: string;
      companyId: number;
    }) => {
      return apiCall('/api/admin/buses', {
        method: 'POST',
        body: JSON.stringify(busData),
      });
    },

    // Get routes
    getRoutes: async (companyId?: number) => {
      const queryParams = companyId ? `?companyId=${companyId}` : '';
      return apiCall(`/api/admin/routes${queryParams}`);
    },

    // Create route
    createRoute: async (routeData: {
      origin: string;
      destination: string;
      distance?: number;
      duration?: number;
      companyId: number;
    }) => {
      return apiCall('/api/admin/routes', {
        method: 'POST',
        body: JSON.stringify(routeData),
      });
    },
  },
};
