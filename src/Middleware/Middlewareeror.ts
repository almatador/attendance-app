import { Request, Response, NextFunction } from 'express';

const errorLogs: { message: string; stack: string; time: string }[] = [];

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const errorDetail = {
    message: err.message,
    stack: err.stack,
    time: new Date().toISOString(),
  };

  // إضافة تفاصيل الخطأ إلى المصفوفة
  errorLogs.push(errorDetail);

  // الاستمرار في تمرير الخطأ دون معالجته هنا
  next(err);
};

export { errorLogs };
export default errorHandler;
