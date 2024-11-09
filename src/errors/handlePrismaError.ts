import { Prisma } from "@prisma/client";
import { IGenericErrorMessage } from "../interfaces/error";
const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError) => {
    let statusCode = 500;
    let message = 'Something went wrong!';
    let errorMessages: IGenericErrorMessage[] = [];

    if (error.code === 'P2002') {
        const field = (error.meta?.target as string[]) || [];
        statusCode = 400;
        message = `Duplicate entry in ${field.join(', ')}`;
        errorMessages = [
            {
                path: field.join(', '),
                message: `${field.join(', ')} already exists`
            }
        ];
    } else if (error.code === 'P2003') {
        statusCode = 400;
        message = 'Foreign key constraint failed';
    } else if (error.code === 'P2025') {
        statusCode = 404;
        message = 'Record not found';
    }

    return {
        statusCode,
        message,
        errorMessages
    };
};

export default handlePrismaError;
