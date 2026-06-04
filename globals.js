// globals.js — Shared mutable state accessible by renderer.js and main.js
// Must be loaded FIRST in index.html

var W = window.innerWidth;
var H = window.innerHeight;

var STATE = 'pad';

var stars    = [];
var nebulae  = [];
var flyStars = [];
var warpLines = [];

var smoke     = [];
var padShake  = 0;
var engineOn  = false;
var rocketY   = 0;
var rocketVY  = 0;
var ascentT   = 0;
var altKm     = 0;
var velMs     = 0;

var currentPlanet    = null;
var planetSpinAngle  = 0;

var countIv = null;
var frame   = 0;