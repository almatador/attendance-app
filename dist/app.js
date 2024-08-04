"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const body_parser_1 = __importDefault(require("body-parser"));
const adminauth_1 = __importDefault(require("./src/routes/admin/adminauth"));
const plans_1 = __importDefault(require("./src/routes/plans/plans"));
const rule_1 = __importDefault(require("./src/routes/plans/rule"));
const superadmin_1 = __importDefault(require("./src/routes/superadmin/superadmin"));
const attendace_1 = __importDefault(require("./src/routes/user/attendace"));
const vacations_1 = __importDefault(require("./src/routes/user/vacations"));
const vacationsadmin_1 = __importDefault(require("./src/routes/admin/vacationsadmin"));
const userSalary_1 = __importDefault(require("./src/routes/user/userSalary"));
const adminSalary_1 = __importDefault(require("./src/routes/admin/adminSalary"));
const meetingadmin_1 = __importDefault(require("./src/routes/admin/meetingadmin"));
const meetinguser_1 = __importDefault(require("./src/routes/user/meetinguser"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
app.use('/admin', adminauth_1.default);
app.use('/plan', plans_1.default);
app.use('/rule', rule_1.default);
app.use('/super', superadmin_1.default);
app.use('/attendance', attendace_1.default);
app.use('/vacations', vacations_1.default);
app.use('/vacationsadmin', vacationsadmin_1.default);
app.use('/salaryuser', userSalary_1.default);
app.use('/salaryadmin', adminSalary_1.default);
app.use('/meetingadmin', meetingadmin_1.default);
app.use('/meetinguser', meetinguser_1.default);
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).send('Server Is Online');
}));
app.listen(port, () => {
    console.log(`🚀 Server ready at: http://localhost:${port}`);
});
exports.default = app;
//# sourceMappingURL=app.js.map