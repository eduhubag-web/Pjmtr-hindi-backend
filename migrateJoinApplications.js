require("dotenv").config();
const mongoose = require("mongoose");
const JoinApplication = require("./Models/JoinApplication");

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyipOb2BUYfEWZ1fCTDduKmv_lMYyMTaHmfjKZx3PauQGSOzSHWZPkokth8wWSA4jKubg/exec";

async function migrateJoinApplications() {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected.");

    const applications = await JoinApplication.find()
      .sort({ createdAt: 1 });

    console.log(`Found ${applications.length} applications.`);

    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < applications.length; i++) {
      const application = applications[i];

      try {
        console.log(
          `Migrating ${i + 1}/${applications.length}: ${application.fullName}`
        );

        if (
          !application.cvFile?.data ||
          !application.passportPhoto?.data
        ) {
          console.log(
            `Skipped ${application.fullName}: CV or Photo missing`
          );

          failedCount++;
          continue;
        }

        const payload = {
          fullName: application.fullName || "",
          email: application.email || "",
          officialEmail: application.officialEmail || "",
          role: application.role || "",

          date: application.createdAt
            ? new Date(application.createdAt).toLocaleDateString("en-GB")
            : "",

          cvBase64: application.cvFile.data.toString("base64"),
          cvContentType:
            application.cvFile.contentType || "application/pdf",
          cvFilename:
            application.cvFile.filename ||
            `${application.fullName}-CV.pdf`,

          photoBase64:
            application.passportPhoto.data.toString("base64"),
          photoContentType:
            application.passportPhoto.contentType || "image/jpeg",
          photoFilename:
            application.passportPhoto.filename ||
            `${application.fullName}-Photo.jpg`,
        };

        const response = await fetch(APPS_SCRIPT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: JSON.stringify(payload),
          redirect: "follow",
        });

        const resultText = await response.text();

        let result;

        try {
          result = JSON.parse(resultText);
        } catch {
          throw new Error(
            `Invalid Apps Script response: ${resultText.substring(0, 200)}`
          );
        }

        if (!result.success) {
          throw new Error(
            result.message || "Apps Script migration failed"
          );
        }

        successCount++;

        console.log(`✅ Migrated: ${application.fullName}`);

        // Small delay to avoid sending requests too quickly
        await new Promise((resolve) => setTimeout(resolve, 500));

      } catch (applicationError) {

        failedCount++;

        console.error(
          `❌ Failed: ${application.fullName}`,
          applicationError.message
        );
      }
    }

    console.log("\n==============================");
    console.log("Migration completed");
    console.log(`Success: ${successCount}`);
    console.log(`Failed: ${failedCount}`);
    console.log("==============================");

  } catch (error) {

    console.error("Migration failed:", error);

  } finally {

    await mongoose.disconnect();

    console.log("MongoDB disconnected.");
  }
}

migrateJoinApplications();
