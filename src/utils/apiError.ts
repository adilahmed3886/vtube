class ApiError extends Error {
    constructor(
        public statusCode: number,
        public message: string = "Something went wrong",
        public errors: Error[] = [],
        public stack?: string,
        public data: null = null,
        public isSuccess: boolean = false,

    ) {
        super(message);
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };