import express from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const superAdminRouter = express.Router();
const prisma = new PrismaClient();



const generateSecretKey = () => {
    return crypto.randomBytes(64).toString('hex');
};

superAdminRouter.post('/createSuperAdmin', async (req, res) => {
  const { name, username, email, phoneNumber, password } = req.body;

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
  
    const superAdmin = await prisma.superAdmin.create({
      data: {
        name:name,
        username :username,
        email : email,
        phoneNumber:phoneNumber,
        password :hashedPassword,
        secretKeys: {
            create: {
                token: generateSecretKey(), // Generate and include secret key
            }
        }
      },
    });
    res.status(201).json(superAdmin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating the super admin.' });
  }
});
superAdminRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send("الرجاء تقديم البريد الإلكتروني وكلمة المرور");
    }
  
    try {
        const admin = await prisma.superAdmin.findUnique({
            where: {
                email: email,
            },
        });

        if (admin && bcrypt.compareSync(password, admin.password)) {
            const newToken = generateSecretKey();
            
            const secretKeyAdmin = await prisma.secretKeySuperadmin.findMany({
                where: {
                    superAdminId: admin.id,
                },
            });
 
            if (secretKeyAdmin) {
                await prisma.secretKeySuperadmin.update({
                    where: {
                        id: admin.id,
                    },
                    data: {
                        token: newToken,
                    },
                });
            } else {
                await prisma.secretKeySuperadmin.create({
                    data: {
                        superAdminId: admin.id,
                        token: newToken,
                    },
                });
            }

            res.status(200).json({ admin, token: newToken });
        } else {
            res.status(404).send("الايميل او كلمة المرور خطأ");
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).send("حدث مشكلة في السيرفر");
    }
});
superAdminRouter.post('/logout/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(parseInt(id))) {
            return res.status(400).send('Invalid ID');
        }

        await prisma.secretKeySuperadmin.updateMany({
            where: {
                superAdminId: parseInt(id)
            },
            data: {
                token: "null"
            }
        });

        res.clearCookie('token'); // Adjust the cookie name if different
        res.status(200).send("تم تسجيل الخروج بنجاح");
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).send("حدث مشكلة في السيرفر");
    }
});

export default superAdminRouter;
