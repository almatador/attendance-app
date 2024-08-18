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
const database_1 = __importDefault(require("../database"));
function calculateMonthlySalary(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Fetch salary record for the current month
            const [salaryRows] = yield database_1.default.promise().query('SELECT * FROM Salary WHERE userId = ? AND MONTH(period) = MONTH(CURDATE()) AND YEAR(period) = YEAR(CURDATE())', [userId]);
            const salary = salaryRows[0];
            if (salary) {
                // Calculate final salary after deductions
                const netSalary = salary.basicSalary + salary.increase + salary.projectPercentage - salary.emergencyDeductions - salary.salaryDeduction;
                // Update salary record
                yield database_1.default.promise().query('UPDATE Salary SET netSalary = ?, salaryDeduction = 0 WHERE id = ?', [netSalary, salary.id]);
            }
        }
        catch (error) {
            console.error('Error calculating monthly salary:', error);
        }
    });
}
//# sourceMappingURL=salaryfaun.js.map