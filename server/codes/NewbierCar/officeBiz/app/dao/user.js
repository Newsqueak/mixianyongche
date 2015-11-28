///**
// * Module dependencies.
// */
//
//var crypto = require('crypto');
//var common = require("../../common");
//
//var Schema = common.DBObject.Schema;
//
///**
// * User Schema
// */
//
//var localUserSchema = new Schema({
//    _id: {type: String, required: true},
//    un: {type: String, required: true, index: {unique: true, sparse: true}},
//    email: {type: String, default: ""},
//    phone: {type: String, default: ""},
//    name: {type: String, default: ""},
//    provider: {type: String, default: "local"},
//    hashed_password: {type: String, default: ""},
//    salt: {type: String, default: ""},
//    tkn: {type: String, required: true, index: {unique: true, sparse: true}},
//    avatar_url: {type: String, default: ""}
//
//}, {versionKey: false});
//
//
///**
// * Virtuals
// */
//
//localUserSchema
//    .virtual('password')
//    .set(function (password) {
//        this._password = password;
//        this.salt = this.makeSalt();
//        this.hashed_password = this.encryptPassword(password);
//    })
//    .get(function () {
//        return this._password
//    });
//
///**
// * Validations
// */
//
//var validatePresenceOf = function (value) {
//    return value && value.length;
//};
//
//localUserSchema.path('un').validate(function (username) {
//    return username.length;
//}, 'Username cannot be blank');
//
//localUserSchema.path('name').validate(function (name) {
//    return name.length;
//}, 'Name cannot be blank');
//
//localUserSchema.path('hashed_password').validate(function (hashed_password) {
//    return hashed_password.length;
//}, 'Password cannot be blank');
//
//localUserSchema.path('un').validate(function (username, fn) {
//    var User = common.DBObject.archives.model('User');
//
//    // Check only when it is a new user or when username field is modified
//    if (this.isNew || this.isModified('un')) {
//        User.find({un: username}).exec(function (err, users) {
//            fn(!err && users.length === 0);
//        });
//    } else fn(true);
//}, 'Username already exists');
//
//
///**
// * Pre-save hook
// */
//
//localUserSchema.pre('save', function (next) {
//    if (!this.isNew) return next();
//
//    if (!validatePresenceOf(this.password)) {
//        next(new Error('Invalid password'));
//    } else {
//        next();
//    }
//});
//
///**
// * Methods
// */
//
//localUserSchema.methods = {
//
//
//    authenticate: function (plainText) {
//        return this.encryptPassword(plainText) === this.hashed_password;
//    },
//
//
//    makeSalt: function () {
//        return Math.round((new Date().valueOf() * Math.random())) + '';
//    },
//
//
//    encryptPassword: function (password) {
//        if (!password) return '';
//        try {
//            return crypto
//                .createHmac('sha1', this.salt)
//                .update(password)
//                .digest('hex');
//        } catch (err) {
//            return '';
//        }
//    }
//
//};
//
///**
// * Statics
// */
//
//localUserSchema.statics = {
//
//    load: function (options, cb) {
//        options.select = options.select || '_id un name avatar_url';
//        this.findOne(options.criteria)
//            .select(options.select)
//            .exec(cb);
//    }
//};
//
//var LocalUserDao = module.exports = exports =
//    common.DBObject.archives.model('User', localUserSchema);
