export const adminUser = {
  id: 1,
  userName: 'admin',
  ci: '12345678',
  names: 'Carlos',
  lastName: 'Mamani',
  secondLastName: 'Quispe',
  role: 'admin',
  branchId: 1,
  email: 'admin@sicme.com',
  isFirstLogin: false,
};

export const preseller = {
  id: 2,
  userName: 'jperez',
  ci: '87654321',
  names: 'Juan',
  lastName: 'Pérez',
  secondLastName: 'López',
  role: 'prevendedor',
  branchId: 1,
  email: null,
  isFirstLogin: false,
};

export const driver = {
  id: 3,
  userName: 'mflores',
  ci: '11223344',
  names: 'Mario',
  lastName: 'Flores',
  secondLastName: null,
  role: 'transportista',
  branchId: 2,
  email: null,
  isFirstLogin: false,
};

export const allUsers = [adminUser, preseller, driver];

export const branches = [
  { id: 1, name: 'Central', state: true },
  { id: 2, name: 'Norte', state: true },
];

export const areas = [
  { id: 1, name: 'Zona Centro', area: [{ lat: -17.39, lng: -66.16 }, { lat: -17.40, lng: -66.15 }, { lat: -17.41, lng: -66.16 }], state: true },
  { id: 2, name: 'Zona Norte', area: [{ lat: -17.36, lng: -66.16 }, { lat: -17.37, lng: -66.15 }, { lat: -17.38, lng: -66.16 }], state: true },
];

export const routes = [
  {
    id: 1,
    assignedIdUser: 2,
    assignedIdArea: 1,
    assignedDate: '2024-06-01',
    user: preseller,
    area: areas[0],
  },
];

export const clients = [
  { id: 1, name: 'Ana', lastName: 'García', secondLastName: 'Vela', phone: '70011002', clientTypeId: 1, areaId: 1 },
  { id: 2, name: 'Pedro', lastName: 'Rojas', secondLastName: '', phone: '70022003', clientTypeId: 1, areaId: 2 },
];

export const businesses = {
  data: [
    { id: 1, name: 'Bodega Central', clientId: 1, businessTypeId: 1, state: true },
  ],
  total: 1,
  page: 1,
  limit: 10,
  totalPages: 1,
};

export const products = {
  data: [
    { id: 1, name: 'Cable 1.5mm', categoryId: 1, brandId: 1, prices: [{ priceTypeId: 1, price: 5.5 }] },
    { id: 2, name: 'Tomacorriente', categoryId: 2, brandId: 1, prices: [{ priceTypeId: 1, price: 12.0 }] },
  ],
  total: 2,
  page: 1,
  limit: 10,
  totalPages: 1,
};

export const categories = [
  { id: 1, name: 'Cables', state: true },
  { id: 2, name: 'Enchufes', state: true },
];

export const brands = [
  { id: 1, name: 'Voltex', state: true },
];

export const colors = [
  { id: 1, name: 'Rojo', state: true },
];

export const presentations = [
  { id: 1, name: 'Caja x 100', state: true },
];

export const presales = {
  data: [
    {
      id: 1,
      clientId: 1,
      businessId: 1,
      branchId: 1,
      status: 'pendiente',
      deliveryDate: '2024-06-10',
      details: [],
      client: clients[0],
    },
  ],
  total: 1,
  page: 1,
  limit: 10,
  totalPages: 1,
};

export const inventory = {
  data: [
    {
      id: 1,
      name: 'Cable 1.5mm',
      barcode: null,
      internalCode: null,
      presentationId: null,
      colorId: null,
      prices: [{ priceTypeId: 1, price: 5.5 }],
      brand: { id: 1, name: 'Voltex' },
      category: { id: 1, name: 'Cables' },
      branch: { branchId: 1, hasStock: true, stockQty: 50 },
    },
  ],
  total: 1,
  totalPages: 1,
  page: 1,
  limit: 10,
};

export const activities = {
  date: '2024-06-01',
  userId: 2,
  role: 'prevendedor',
  businesses: [
    { businessId: 1, businessName: 'Bodega Central', lat: -17.39, lng: -66.16, visited: true },
  ],
};