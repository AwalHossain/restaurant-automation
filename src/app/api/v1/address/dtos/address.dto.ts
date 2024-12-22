export interface CreateAddressInput {
  street: string;
  city: string;
  state?: string;
  postalCode?: string;
  latitude?: string;
  longitude?: string;
  isDefault?: boolean;
  label?: string;  // home, office, etc.
  additionalDirections?: string;
}

export interface UpdateAddressInput extends Partial<CreateAddressInput> {
  id: string;
} 