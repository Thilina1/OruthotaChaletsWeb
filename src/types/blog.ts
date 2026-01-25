export interface Blog {
  id: string;
  header1: string;
  content1: string;
  content2?: string;
  contentImage: string;
  authorId: string;
  createdAt: any; // Can be a string, or a Firestore Timestamp
  bookingButtonContent?: string;
  bookingButtonText?: string;
  color?: string;
  featured?: boolean;
  featuredPosition?: number;
}
