"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = __importDefault(require("../database"));
const Middlewaresuperadmin_1 = __importDefault(require("../../Middleware/Middlewaresuperadmin")); // افترض أن هذا هو مسار الـ Middleware
const ruleRouter = express_1.default.Router();
ruleRouter.use(Middlewaresuperadmin_1.default);
// Create a new rule
ruleRouter.post('/create', (req, res) => {
    const { name, description } = req.body;
    const query = `
    INSERT INTO rule (name, description)
    VALUES (?, ?)
  `;
    database_1.default.query(query, [name, description], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'An error occurred while creating the rule.' });
        }
        // Cast results to ResultSetHeader to access insertId
        const resultSetHeader = results;
        res.status(201).json({ id: resultSetHeader.insertId, name, description });
    });
});
// Get all rules
ruleRouter.get('/', (req, res) => {
    const query = `SELECT * FROM rule`;
    database_1.default.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'An error occurred while fetching the rules.' });
        }
        res.status(200).json(results);
    });
});
// Get a rule by ID
ruleRouter.get('/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const query = `SELECT * FROM rule WHERE id = ?`;
    database_1.default.query(query, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'An error occurred while fetching the rule.' });
        }
        // Ensure results is an array
        if (Array.isArray(results) && results.length > 0) {
            res.status(200).json(results[0]);
        }
        else {
            res.status(404).json({ error: 'Rule not found.' });
        }
    });
});
// Update a rule by ID
ruleRouter.put('/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { name, description } = req.body;
    const query = `
    UPDATE rule
    SET name = ?, description = ?
    WHERE id = ?
  `;
    database_1.default.query(query, [name, description, id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'An error occurred while updating the rule.' });
        }
        res.status(200).json({ id, name, description });
    });
});
// Delete a rule by ID
ruleRouter.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const query = `DELETE FROM rule WHERE id = ?`;
    database_1.default.query(query, [id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'An error occurred while deleting the rule.' });
        }
        res.status(204).send();
    });
});
// Add a rule to a plan
ruleRouter.post('/:ruleId/plan/:planId', (req, res) => {
    const ruleId = parseInt(req.params.ruleId, 10);
    const planId = parseInt(req.params.planId, 10);
    const query = `
    INSERT INTO plan_rule (ruleId, planId)
    VALUES (?, ?)
  `;
    database_1.default.query(query, [ruleId, planId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'An error occurred while adding the rule to the plan.' });
        }
        // Cast results to ResultSetHeader to access insertId
        const resultSetHeader = results;
        res.status(201).json({ id: resultSetHeader.insertId, ruleId, planId });
    });
});
// Remove a rule from a plan
ruleRouter.delete('/:ruleId/plan/:planId', (req, res) => {
    const ruleId = parseInt(req.params.ruleId, 10);
    const planId = parseInt(req.params.planId, 10);
    const query = `DELETE FROM plan_rule WHERE ruleId = ? AND planId = ?`;
    database_1.default.query(query, [ruleId, planId], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'An error occurred while removing the rule from the plan.' });
        }
        res.status(204).send();
    });
});
exports.default = ruleRouter;
//# sourceMappingURL=rule.js.map