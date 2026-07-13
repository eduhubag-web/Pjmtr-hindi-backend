const express = require("express");

const router = express.Router();

const editorialController = require("../Controllers/editorialController");

const upload = require("../Middleware/editorialUpload"); 

// Add Member
router.post("/add", upload.single("image"), editorialController.addMember);

// Dashboard
router.get("/all", editorialController.getMembers);

// Website
router.get("/active", editorialController.getActiveMembers);
router.get("/image/:id", editorialController.getMemberImage);
// Update Member
router.put("/update/:id", upload.single("image"), editorialController.updateMember);

// Delete Member
router.delete("/delete/:id", editorialController.deleteMember);

// Change Status
router.patch("/status/:id", editorialController.changeStatus);

module.exports = router;
