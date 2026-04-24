type Error = {
  message?: string;
  response?: {
    status: number;
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
      error?: string;
    };
  };
};

export default function mapErrors(error: Error): {
  errors: any;
  message: string;
} {
  const errorMessage =
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    "Something went wrong.";
  if (error.response?.status === 422) {
    const backendErrors = error.response?.data?.errors;

    if (!backendErrors) {
      return {
        errors: null,
        message: errorMessage,
      };
    }

    const errors = Object.keys(backendErrors).map((field) => ({
      name: field,
      errors: [backendErrors[field]],
    }));
    return {
      errors,
      message: errorMessage,
    };
  }
  return {
    errors: null,
    message: errorMessage,
  };
}

export function mapErrorsInObject(
  error: Error,
  fieldKeyMap: Record<string, string>,
): { errors: any; message: string } {
  const errorMessage =
    error.response?.data?.message || error.message || "Something went wrong.";
  if (error.response?.status === 422) {
    const backendErrors = error.response?.data?.errors;

    if (!backendErrors) {
      return {
        errors: null,
        message: errorMessage,
      };
    }

    const errors = Object.entries(backendErrors).map(([key, messages]) => ({
      name: [fieldKeyMap[key] || key], // AntD requires name to be an array
      errors: messages,
    }));

    return {
      errors,
      message: errorMessage,
    };
  }

  return {
    errors: null,
    message: errorMessage,
  };
}
