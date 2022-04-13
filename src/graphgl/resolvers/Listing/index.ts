import { Listing } from '../../../lib/types';

export const listingResolvers = {
  Listing: {
    id: (listing: Listing): string => listing._id.toString()
  }
}
