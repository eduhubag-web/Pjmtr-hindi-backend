// Controllers/JoinController.js
const JoinApplication = require("../Models/JoinApplication");

// Create application
exports.createJoinApplication = async (req, res) => {
  try {
   const { fullName, email, officialEmail, role, experience, message } = req.body;

    if (!req.files?.cvFile || !req.files?.passportPhoto) {
  return res.status(400).json({ message: "CV and passport photo are required" });
}

  const newApp = new JoinApplication({
  fullName,
  email,
  officialEmail,
  role,
  experience,
  message,

  cvFile: {
    data: req.files.cvFile[0].buffer,
    contentType: req.files.cvFile[0].mimetype,
    filename: req.files.cvFile[0].originalname
  },

  passportPhoto: {
    data: req.files.passportPhoto[0].buffer,
    contentType: req.files.passportPhoto[0].mimetype,
    filename: req.files.passportPhoto[0].originalname
  }
});
    await newApp.save();
    res.status(201).json({ message: "Application submitted successfully" });
  } catch (error) {
    console.error("Error creating application:", error);
    res.status(500).json({ message: "Failed to create application" });
  }
};


// Get all applications
exports.getAllJoinApplications = async (req, res) => {
  try {
    const applications = await JoinApplication.find()
      .select("-cvFile.data -passportPhoto.data")
      .sort({ createdAt: -1 });

    return res.json(applications);

  } catch (error) {
    console.error("Error fetching applications:", error);
    return res.status(500).json({
      message: "Failed to fetch applications",
    });
  }
};
// Download CV
exports.downloadCV = async (req, res) => {
  try {
    const application = await JoinApplication.findById(req.params.id) .select("cvFile");
    if (!application || !application.cvFile || !application.cvFile.data) {
      return res.status(404).json({ message: "CV not found" });
    }

    res.set({
      "Content-Type": application.cvFile.contentType,
      "Content-Disposition": `attachment; filename="${application.cvFile.filename}"`
    });
    res.send(application.cvFile.data);
  } catch (error) {
    console.error("Error downloading CV:", error);
    res.status(500).json({ message: "Failed to download CV" });
  }
};
// Download Photo
exports.downloadPhoto = async (req, res) => {
  try {
    const application = await JoinApplication.findById(req.params.id)
  .select("passportPhoto");

    if (
      !application ||
      !application.passportPhoto ||
      !application.passportPhoto.data
    ) {
      return res.status(404).json({ message: "Photo not found" });
    }

    res.set({
      "Content-Type": application.passportPhoto.contentType,
      "Content-Disposition": `attachment; filename="${application.passportPhoto.filename}"`
    });

    res.send(application.passportPhoto.data);

  } catch (error) {
    console.error("Error downloading photo:", error);

    res.status(500).json({
      message: "Failed to download photo"
    });
  }
};
