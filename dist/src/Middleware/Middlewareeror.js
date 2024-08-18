"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorLogs = void 0;
const errorLogs = [];
exports.errorLogs = errorLogs;
const errorHandler = (err, req, res, next) => {
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
exports.default = errorHandler;
//# sourceMappingURL=Middlewareeror.js.map