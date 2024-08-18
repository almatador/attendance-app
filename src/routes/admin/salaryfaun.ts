import connection from "../database";


async function calculateMonthlySalary(userId: any) {
    try {
      // Fetch salary record for the current month
      const [salaryRows]: [any[], any] = await connection.promise().query('SELECT * FROM Salary WHERE userId = ? AND MONTH(period) = MONTH(CURDATE()) AND YEAR(period) = YEAR(CURDATE())', [userId]);
      const salary = salaryRows[0];
      
      if (salary) {
        // Calculate final salary after deductions
        const netSalary = salary.basicSalary + salary.increase + salary.projectPercentage - salary.emergencyDeductions - salary.salaryDeduction;
        
        // Update salary record
        await connection.promise().query('UPDATE Salary SET netSalary = ?, salaryDeduction = 0 WHERE id = ?', [netSalary, salary.id]);
      }
    } catch (error) {
      console.error('Error calculating monthly salary:', error);
    }
  }
  