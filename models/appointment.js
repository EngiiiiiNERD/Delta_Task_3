var mongoose = require("mongoose");

var AppointmentSchema = new mongoose.Schema({
    unique_id   : String,           
    title       : String, 
    description : String,  
    start_time  : String,  
    end_time    : String
});

module.exports = mongoose.model("Appointment",AppointmentSchema);