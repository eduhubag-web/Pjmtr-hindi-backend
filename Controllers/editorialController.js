const EditorialMember = require("../Models/EditorialMember");


// Add Member
exports.addMember = async (req, res) => {
  try {
    const { name, designation, affiliation, status } = req.body;

    if (!name || !designation || !affiliation) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Image is required",
      });
    }

   const member = new EditorialMember({
  name,
  designation,
  affiliation,
  status: status || "Active",

  image: {
    data: req.file.buffer,
    contentType: req.file.mimetype,
  },
});

    await member.save();

    res.status(201).json({
      message: "Member added successfully",
      member,
    });

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// Get All Members
exports.getMembers = async (req, res) => {
  try {

   const members = await EditorialMember.find(
  {},
  {
    "image.data": 0,
  }
).sort({
  createdAt: -1,
});

    res.json(members);

  } catch (err) {

    res.status(500).json({
      error: err.message,
    });

  }
};

// Get Active Members (Website)
exports.getActiveMembers = async (req, res) => {

  try {

    const members = await EditorialMember.find(
  {
    status: "Active",
  },
  {
    "image.data": 0,
  }
).sort({
  createdAt: -1,
});

    res.json(members);

  } catch (err) {

    res.status(500).json({
      error: err.message,
    });

  }

};
// Update Member
exports.updateMember = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await EditorialMember.findById(id);

    if (!member) {
      return res.status(404).json({
        message: "Member not found",
      });
    }

    member.name = req.body.name || member.name;
    member.designation = req.body.designation || member.designation;
    member.affiliation = req.body.affiliation || member.affiliation;

    if (req.body.status) {
      member.status = req.body.status;
    }

   if (req.file) {
  member.image = {
    data: req.file.buffer,
    contentType: req.file.mimetype,
  };
}

    await member.save();

    res.json({
      message: "Member updated successfully",
      member,
    });

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};
// Delete Member
exports.deleteMember = async (req, res) => {
  try {

    const member = await EditorialMember.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        message: "Member not found",
      });
    }

    await EditorialMember.findByIdAndDelete(req.params.id);

    res.json({
      message: "Member deleted successfully",
    });

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};
// Change Member Status
exports.changeStatus = async (req, res) => {
  try {

    const member = await EditorialMember.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        message: "Member not found",
      });
    }

    member.status =
      member.status === "Active"
        ? "Inactive"
        : "Active";

    await member.save();

    res.json({
      message: "Status updated successfully",
      member,
    });

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};
// Get Member Image
exports.getMemberImage = async (req, res) => {
  try {

    const member = await EditorialMember.findById(req.params.id);

    if (!member || !member.image || !member.image.data) {
      return res.status(404).send("Image not found");
    }

    res.set("Content-Type", member.image.contentType);

    res.send(member.image.data);

  } catch (err) {

    res.status(500).json({
      error: err.message,
    });

  }
};
