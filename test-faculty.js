const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const faculty = await prisma.faculty.findFirst({
      where: { is_published: true },
      include: {
        media_assets: true,
      },
    });

    console.log('Faculty Data:');
    console.log('Name:', faculty?.full_name_en);
    console.log('Profile Image ID:', faculty?.profile_image_id);
    console.log('Media Assets:', faculty?.media_assets);

    if (faculty?.media_assets) {
      console.log('\nMedia Asset Details:');
      console.log('File Path:', faculty.media_assets.file_path);
      console.log('ID:', faculty.media_assets.id);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
})();
