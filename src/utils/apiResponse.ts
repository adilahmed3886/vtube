class ApiResponse<T> {
    constructor(
        public statusCode: number,
        public message: string = "Success!",
        public data: T = {} as T
    ){}
}

export { ApiResponse }