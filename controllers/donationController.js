const mongoose = require("mongoose");
const Donation = require("../models/Donation");

// CREATE DONATION
exports.createDonation = async (req, res, next) => {
  try {
    const donation = await Donation.create(req.body);

    res.status(201).json({
      success: true,
      message: "Food donation created successfully",
      data: donation
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL DONATIONS
exports.getAllDonations = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.location) {
      filter.location = {
        $regex: req.query.location,
        $options: "i"
      };
    }

    const donations = await Donation.find(filter)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations
    });
  } catch (error) {
    next(error);
  }
};

// GET DONATION BY ID
exports.getDonationById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid donation ID"
      });
    }

    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found"
      });
    }

    res.status(200).json({
      success: true,
      data: donation
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE DONATION
exports.updateDonation = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid donation ID"
      });
    }

    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Donation updated successfully",
      data: donation
    });
  } catch (error) {
    next(error);
  }
};

// DELETE DONATION
exports.deleteDonation = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid donation ID"
      });
    }

    const donation = await Donation.findByIdAndDelete(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Donation deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE DONATION STATUS
exports.updateDonationStatus = async (req, res, next) => {
  try {
    const { status, claimedBy } = req.body;

    const allowedStatuses = [
      "Available",
      "Claimed",
      "Collected",
      "Expired"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid donation status"
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid donation ID"
      });
    }

    const update = { status };

    if (status === "Claimed" && claimedBy) {
      update.claimedBy = claimedBy;
    }

    if (status === "Available") {
      update.claimedBy = "";
    }

    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Donation status updated successfully",
      data: donation
    });
  } catch (error) {
    next(error);
  }
};