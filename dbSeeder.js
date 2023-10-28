const { PrismaClient } = require('@prisma/client');
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

async function main() {
    const contrasenaHasheada = await bcrypt.hash('admin', 10);
    await prisma.profesional.create({
        data: {
            especiality: "N/A",
            name: "admin",
            last_name: "N/A",
            min_score: 16,
            max_score: 20,
            user: {
                create: {
                    rut: "admin",
                    role: "ADMIN",
                    password: contrasenaHasheada,
                },
            },
        },
    });
}

main()
    .catch((e) => {
        throw e;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });