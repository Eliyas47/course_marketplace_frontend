import api from './axios';

const CATEGORY_CREATE_PATHS = [
  '/courses/categories/',
  '/courses/categories/create/',
  '/categories/',
  '/categories/create/',
  '/course-categories/',
  '/course-categories/create/',
];

const CATEGORY_LIST_PATHS = [
  '/courses/categories/',
  '/categories/',
  '/course-categories/',
];

const toArray = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.results)) {
    return payload.results;
  }

  return [];
};

const toCount = (payload) => {
  if (typeof payload?.count === 'number') {
    return payload.count;
  }

  if (Array.isArray(payload)) {
    return payload.length;
  }

  return 0;
};

export const getDashboardPathForRole = (role) => {
  const normalizedRole = String(role || '').toLowerCase();

  if (normalizedRole === 'admin') {
    return '/admin/dashboard';
  }

  if (normalizedRole === 'instructor') {
    return '/instructor/dashboard';
  }

  return '/dashboard';
};

export const authApi = {
  loginWithToken: (payload) => api.post('/token/', payload),
  loginLegacy: (payload) => api.post('/auth/login/', payload),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (payload) => api.put('/auth/profile/', payload),
};

export const coursesApi = {
  list: (params) => api.get('/courses/', { params }),
  detail: (courseId) => api.get(`/courses/${courseId}/`),
  learn: (courseId) => api.get(`/courses/${courseId}/learn/`),
  dashboard: () => api.get('/courses/dashboard/'),
  create: (payload) => {
    if (payload instanceof FormData) {
      return api.post('/courses/create/', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }

    return api.post('/courses/create/', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
  update: (courseId, payload) => api.patch(`/courses/${courseId}/update/`, payload),
  setPublishStatus: async (courseId, nextStatus) => {
    try {
      return await api.patch(`/courses/${courseId}/update/`, { is_published: nextStatus });
    } catch (patchError) {
      const patchStatus = patchError?.response?.status;
      const mayNeedFullPayload = patchStatus === 400 || patchStatus === 405;

      if (!mayNeedFullPayload) {
        throw patchError;
      }

      const detailRes = await api.get(`/courses/${courseId}/`);
      const course = detailRes.data || {};

      const fullPayload = {
        title: course.title,
        description: course.description,
        price: String(course.price ?? '0.00'),
        level: course.level,
        category: course.category?.id || course.category?.uuid || course.category,
        is_published: nextStatus,
      };

      return api.put(`/courses/${courseId}/update/`, fullPayload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  },
  categories: async () => {
    let lastError;

    for (const path of CATEGORY_LIST_PATHS) {
      try {
        return await api.get(path);
      } catch (error) {
        const status = error?.response?.status;
        const shouldTryNext = status === 404 || status === 405;

        if (!shouldTryNext) {
          throw error;
        }

        lastError = error;
      }
    }

    const notAvailableError = new Error('Category list endpoint is not available in backend.');
    notAvailableError.code = 'CATEGORY_LIST_ENDPOINT_NOT_FOUND';
    notAvailableError.cause = lastError;
    throw notAvailableError;
  },
  createCategory: async (payload) => {
    let lastError;

    for (const path of CATEGORY_CREATE_PATHS) {
      try {
        return await api.post(path, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        const status = error?.response?.status;
        const shouldTryNext = status === 404 || status === 405;

        if (!shouldTryNext) {
          throw error;
        }

        lastError = error;
      }
    }

    const notAvailableError = new Error('Category create endpoint is not available in backend.');
    notAvailableError.code = 'CATEGORY_CREATE_ENDPOINT_NOT_FOUND';
    notAvailableError.cause = lastError;
    throw notAvailableError;
  },
};

export const enrollmentsApi = {
  list: () => api.get('/enrollments/'),
  myCourses: () => api.get('/enrollments/my-courses/'),
  enroll: (courseId) => api.post('/enrollments/enroll/', { course: courseId }),
  markLessonProgress: (payload) => api.post('/enrollments/lesson-progress/', payload),
  getLessonProgress: () => api.get('/enrollments/lesson-progress/'),
  updateLessonProgress: (id, payload) => api.patch(`/enrollments/lesson-progress/${id}/`, payload),
  deleteLessonProgress: (id) => api.delete(`/enrollments/lesson-progress/${id}/`),
  readCourseProgress: (courseId) => api.get(`/enrollments/progress/${courseId}/`),
  getEnrollment: (id) => api.get(`/enrollments/${id}/`),
  updateEnrollment: (id, payload) => api.patch(`/enrollments/${id}/`, payload),
  deleteEnrollment: (id) => api.delete(`/enrollments/${id}/`),
};

export const certificatesApi = {
  myCertificates: () => api.get('/certificates/my-certificates/'),
};

export const modulesApi = {
  create: (payload) => api.post('/courses/modules/create/', payload),
};

export const lessonsApi = {
  create: (payload) => api.post('/courses/lessons/create/', payload),
  detail: (lessonId) => api.get(`/courses/lessons/${lessonId}/`),
};

export const paymentsApi = {
  pay: (courseId) => api.post('/payments/pay/', { course: courseId }),
  list: () => api.get('/payments/pay/'),
};

export const responseUtils = {
  toArray,
  toCount,
};
