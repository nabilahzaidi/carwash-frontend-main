import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  Firestore,
  Timestamp,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.authDomain
);

export const firebaseApp: FirebaseApp | null = hasFirebaseConfig
  ? initializeApp(firebaseConfig)
  : null;
export const auth = firebaseApp ? getAuth(firebaseApp) : null;
export const db: Firestore | null = firebaseApp ? getFirestore(firebaseApp) : null;

const fallbackServices = [
  {
    name: 'Exterior Shine',
    images:
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900&q=80',
    serviceLevel: 'Premium',
    description: 'Complete exterior wash and polish.',
    price: 55,
    duration: 45,
    isDeleted: false,
  },
  {
    name: 'Interior Detail',
    images:
      'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=900&q=80',
    serviceLevel: 'Deluxe',
    description: 'Deep interior vacuuming and upholstery care.',
    price: 80,
    duration: 60,
    isDeleted: false,
  },
  {
    name: 'Express Wash',
    images:
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80',
    serviceLevel: 'Express',
    description: 'Fast and efficient wash for busy schedules.',
    price: 35,
    duration: 25,
    isDeleted: false,
  },
];

const fallbackReviews = [
  {
    feedback: 'Excellent service and friendly staff.',
    rating: 5,
    profileImg:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  },
  {
    feedback: 'Very quick turnaround and the car looked brand new.',
    rating: 4,
    profileImg:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  },
];

const SERVICES_STORAGE_KEY = 'carwash_local_services';

const readStoredServices = (): Array<Record<string, unknown>> => {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(SERVICES_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Unable to read local services cache:', error);
    return [];
  }
};

const writeStoredServices = (services: Array<Record<string, unknown>>) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
  } catch (error) {
    console.warn('Unable to save local services cache:', error);
  }
};

export const isFirebaseConfigured = () => Boolean(firebaseApp && auth && db);

const ensureFirebase = () => {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured. Add your Firebase credentials to the environment variables.');
  }
};

const toPlainData = (value: unknown): unknown => {
  if (value && typeof value === 'object' && 'toDate' in (value as object)) {
    const timestamp = value as Timestamp;
    return timestamp.toDate().toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => toPlainData(item));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [key, toPlainData(nestedValue)])
    );
  }

  return value;
};

const normalizeDoc = (docSnapshot: any): any => {
  const data = docSnapshot.data();
  const plainData = toPlainData(data);
  const normalizedData =
    plainData && typeof plainData === 'object' ? (plainData as Record<string, any>) : {};

  return {
    id: docSnapshot.id,
    _id: normalizedData._id || docSnapshot.id,
    ...normalizedData,
  };
};

export const signInWithFirebase = async (email: string, password: string) => {
  ensureFirebase();
  const credential = await signInWithEmailAndPassword(auth!, email, password);
  const token = await credential.user.getIdToken();
  const profile = await getUserProfileByEmail(credential.user.email || email);

  const user = {
    uid: credential.user.uid,
    email: credential.user.email,
    name: profile?.name || credential.user.displayName || credential.user.email,
    role: profile?.role || 'user',
    phone: profile?.phone || '',
    address: profile?.address || '',
  };

  return {
    user,
    token,
  };
};

export const signUpWithFirebase = async (payload: Record<string, unknown>) => {
  ensureFirebase();
  const credential = await createUserWithEmailAndPassword(
    auth!,
    String(payload.email || ''),
    String(payload.password || '')
  );
  const userPayload = {
    uid: credential.user.uid,
    email: credential.user.email,
    name: payload.name || credential.user.email,
    phone: payload.phone || '',
    address: payload.address || '',
    role: payload.role || 'user',
    createdAt: serverTimestamp(),
  };

  await setDoc(doc(db!, 'users', credential.user.uid), userPayload, { merge: true });
  const token = await credential.user.getIdToken();

  return {
    user: userPayload,
    token,
  };
};

export const signOutFromFirebase = async () => {
  if (!auth) return;
  await firebaseSignOut(auth);
};

export const getUserProfileByEmail = async (email: string) => {
  if (!db) return null;
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', email));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;
  return normalizeDoc(snapshot.docs[0]);
};

export const getUserProfileById = async (userId: string) => {
  if (!db) return null;
  const userRef = doc(db, 'users', userId);
  const snapshot = await getDoc(userRef);
  return snapshot.exists() ? normalizeDoc(snapshot) : null;
};

export const getAllUsers = async () => {
  if (!db) return [];
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map(normalizeDoc);
};

export const updateUserProfile = async (userId: string, payload: Record<string, unknown>) => {
  if (!db) return null;
  const ref = doc(db, 'users', userId);
  await updateDoc(ref, payload as any);
  return { success: true };
};

export const updateUserRole = async (userId: string, role: string) => {
  if (!db) return null;
  const ref = doc(db, 'users', userId);
  await updateDoc(ref, { role } as any);
  return { success: true };
};

export const listServices = async (filters?: Record<string, unknown>) => {
  const storedServices = readStoredServices();
  const localServices = storedServices.filter((service) => !service.isDeleted);

  if (!db) {
    return [...localServices, ...fallbackServices.filter((service) => !service.isDeleted)]
      .filter((service, index, all) => all.findIndex((item) => item.name === service.name) === index)
      .sort((a, b) => Number(a.price) - Number(b.price));
  }

  try {
    const servicesRef = collection(db, 'services');
    const snapshot = await getDocs(servicesRef);
    const services = snapshot.docs.map(normalizeDoc).filter((service) => !service.isDeleted);

    const searchTerm = String(filters?.searchTerm || '').toLowerCase();
    const serviceLevels = Array.isArray(filters?.servicelevel)
      ? filters!.servicelevel.filter(Boolean).map(String)
      : [];
    const sortByPrice = String(filters?.sortByPrice || '');

    let filtered = [...services, ...localServices].filter((service, index, all) => {
      const matchesSearch = !searchTerm || String(service.name).toLowerCase().includes(searchTerm);
      const matchesLevel = serviceLevels.length === 0 || serviceLevels.includes(String(service.serviceLevel || ''));
      return matchesSearch && matchesLevel && all.findIndex((item) => item.name === service.name) === index;
    });

    if (sortByPrice === 'priceAsc') {
      filtered = filtered.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortByPrice === 'priceDesc') {
      filtered = filtered.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortByPrice === 'durationAsc') {
      filtered = filtered.sort((a, b) => Number(a.duration) - Number(b.duration));
    } else if (sortByPrice === 'durationDesc') {
      filtered = filtered.sort((a, b) => Number(b.duration) - Number(a.duration));
    }

    return filtered.length
      ? filtered
      : [...fallbackServices, ...localServices].filter((service, index, all) => all.findIndex((item) => item.name === service.name) === index);
  } catch (error) {
    return [...localServices, ...fallbackServices]
      .filter((service, index, all) => all.findIndex((item) => item.name === service.name) === index)
      .sort((a, b) => Number(a.price) - Number(b.price));
  }
};

export const getServiceById = async (serviceId: string) => {
  if (!db) {
    return fallbackServices.find((service) => service.name.toLowerCase().includes(serviceId.toLowerCase())) || null;
  }

  try {
    const ref = doc(db, 'services', serviceId);
    const snapshot = await getDoc(ref);
    return snapshot.exists() ? normalizeDoc(snapshot) : null;
  } catch (error) {
    return fallbackServices.find((service) => service.name.toLowerCase().includes(serviceId.toLowerCase())) || null;
  }
};

export const createService = async (payload: Record<string, unknown>) => {
  const serviceRecord = {
    ...payload,
    createdAt: new Date().toISOString(),
    isDeleted: false,
  };

  if (!db) {
    const storedServices = readStoredServices();
    const nextServices = [...storedServices, serviceRecord];
    writeStoredServices(nextServices);
    return { id: `local-${Date.now()}`, ...serviceRecord };
  }

  try {
    const ref = await addDoc(collection(db, 'services'), {
      ...serviceRecord,
      createdAt: serverTimestamp(),
    });
    return { id: ref.id, ...serviceRecord };
  } catch (error) {
    const storedServices = readStoredServices();
    const nextServices = [...storedServices, serviceRecord];
    writeStoredServices(nextServices);
    return { id: `local-${Date.now()}`, ...serviceRecord };
  }
};

export const updateService = async (serviceId: string, payload: Record<string, unknown>) => {
  if (!db) return null;

  try {
    const documentId = String(payload._id || payload.id || serviceId || '');
    if (!documentId) {
      return { success: false, message: 'Service id is missing' };
    }

    const ref = doc(db, 'services', documentId);
    await updateDoc(ref, payload as any);
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Service update failed' };
  }
};

export const deleteService = async (serviceId: string) => {
  if (!db) return null;

  try {
    const ref = doc(db, 'services', serviceId);
    await deleteDoc(ref);
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Service deletion failed' };
  }
};

export const listBookings = async (email?: string) => {
  if (!db) return [];
  const snapshot = await getDocs(collection(db, 'bookings'));
  const bookings = snapshot.docs.map(normalizeDoc);
  if (!email) return bookings;
  return bookings.filter((booking) => booking.userEmail === email);
};

export const getBookingById = async (bookingId: string) => {
  if (!db) return null;
  const ref = doc(db, 'bookings', bookingId);
  const snapshot = await getDoc(ref);
  return snapshot.exists() ? normalizeDoc(snapshot) : null;
};

export const createBooking = async (payload: Record<string, unknown>) => {
  if (!db) return null;
  const ref = await addDoc(collection(db, 'bookings'), {
    ...payload,
    createdAt: serverTimestamp(),
    status: 'pending',
  });

  return { id: ref.id, ...payload };
};

export const updateBooking = async (bookingId: string, payload: Record<string, unknown>) => {
  if (!db) return null;
  const ref = doc(db, 'bookings', bookingId);
  await updateDoc(ref, payload as any);
  return { success: true };
};

export const deleteBooking = async (bookingId: string) => {
  if (!db) return null;
  const ref = doc(db, 'bookings', bookingId);
  await deleteDoc(ref);
  return { success: true };
};

export const listReviews = async () => {
  if (!db) return fallbackReviews;
  const snapshot = await getDocs(collection(db, 'reviews'));
  const reviews = snapshot.docs.map(normalizeDoc);
  return reviews.length ? reviews : fallbackReviews;
};

export const createReview = async (payload: Record<string, unknown>) => {
  if (!db) return null;
  const ref = await addDoc(collection(db, 'reviews'), {
    ...payload,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, ...payload };
};

export const deleteReview = async (reviewId: string) => {
  if (!db) return null;
  const ref = doc(db, 'reviews', reviewId);
  await deleteDoc(ref);
  return { success: true };
};
