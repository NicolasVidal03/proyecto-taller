export interface PresaleDetails {
    id: number,
    presaleId?: number | null,
    productId: number,
    productBranchId: number,
    branchId: number,
    quantityRequested: number,
    quantityDelivered: number | null,
    priceTypeId: number,
    unitPrice: number,
    finalUnitPrice: number | null,
    subtotalRequested: number,
    subtotalDelivered: number | null,
    userId: number,
    state: boolean,
    createdAt?: string | null,
    updatedAt?: string | null,
}

export interface PresaleStatusHistory {
    id: number,
    presaleId: Number,
    previousStatus: string | null,
    newStatus?: string | null,
    notes: string | null,
    userId: number,
    createdAt?: string | null,
}

export interface Presale {
    id: number,
    clientId: number,
    businessId: number | null,
    branchId: number | null,
    createdAt?: string,
    updatedAt?: string,
    deliveryDate?: string,
    deliveredAt?: string | null,
    status: string,
    subtotal: number,
    total: number,
    notes?: string | null,
    deliveryNotes?: string | null,
    userId: number,
    state: boolean,
    presaleDetails?: PresaleDetails,
    presaleStatusHistory?: PresaleStatusHistory 
}