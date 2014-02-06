
  // Length in meters.
  // Speed in meters per second.
  // Direction given by angle clockwise from north in radians. Math.PI would be
  // south, Math.PI * 3/2 is west etc.
  Ball = function(x, y, speed, direction) {
    this.b_x = x;
    this.b_y = y;
    this.b_speed = speed;
    this.b_direction = direction;
  };

  // Deceleration on a rolling ball changes with speed.
  // A ball rolling at 2m/s decelerates at 0.7m/s^2.
  // A ball rolling at 3m/s decelerates at 0.9m/s^2.
  // A ball rolled at 3m/s should travel about 7m.
  // A ball rolled at 4m/s should travel about 10m.
  Ball.prototype.update = function(elapsed_time) {
    var d = this.b_speed * elapsed_time;
    this.b_x = this.b_x + (d * Math.sin(this.b_direction));
    this.b_y = this.b_y + (-1 * d * Math.cos(this.b_direction));
    // apply deceleration
    var acc = -0.4 - (0.16 * this.b_speed);
    this.b_speed = this.b_speed + (acc * elapsed_time);
    if (this.b_speed < 0) {
      this.b_speed = 0;
    }
  }

  Ball.prototype.draw = function(ctx, color) {
    ctx.fillStyle = color;
    // * 5 to map meters to pixels (one pixel is 20 cm)
    ctx.fillRect((this.b_x * 5) - 1, (this.b_y * 5) - 1, 2, 2);
  }

  Ball.prototype.onPitch = function() {
    if (this.b_x >= 0 && this.b_x <= 68 && this.b_y >= 0 && this.b_y <= 101) {
      return true;
    }
    return false;	
  }

  Player = function(x, y, color) {
    this.p_x = x;
    this.p_y = y;
    // Radius around player position that player can cover.
    // Standing still he can cover .5m around him. Over time
    // the radius increases as he can run (in any direction).
    this.p_d = 0.5;
    // Standing start
    this.p_speed = 0;
    this.p_color = color;
    this.kicking = false;
    // exclude is a flag used to remove the player temporarily
    // from the interception calculations.
    this.exclude = false;
  };

  Player.prototype.reset = function() {
    this.p_d = 0.5;
    this.p_speed = 0;
    this.exclude = false;
  }

  // Assume acceleration of 2 m/s^2 up to max speed of 8m/s
  Player.prototype.update = function(elapsed_time) {
    var acc = 2;
    this.p_speed = this.p_speed + (acc * elapsed_time);
    if (this.p_speed > 8) this.p_speed = 8;
    this.p_d = this.p_d + (this.p_speed * elapsed_time);
  }

  Player.prototype.draw = function(ctx) {
    ctx.fillStyle = '#000000';
    ctx.fillRect((this.p_x * 5) - 4, (this.p_y * 5) - 4, 8, 8);
    ctx.fillStyle=this.p_color;
    // * 5 to map meters to pixels (one pixel is 20 cm)
    ctx.fillRect((this.p_x * 5) - 3, (this.p_y * 5) - 3, 6, 6);
	if (this.kicking == true) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect((this.p_x * 5) - 2, (this.p_y * 5) - 2, 4, 4);
    }

  }

  // Draw a circle around the player showing the current range that
  // he could have moved to cover since t=0.
  Player.prototype.drawRange = function(ctx) {
    ctx.beginPath();
    ctx.arc(this.p_x * 5, this.p_y * 5, this.p_d * 5, 0, 2*Math.PI);
    ctx.stroke();
  }
  
  // Check if the ball is within interception range of the player i.e.
  // within the circle that the player could have run to in the time
  // since the ball started moving.
  // Returns a distance squared. If that value is positive to the ball
  // is outside the player's range. If negative it is within the player's
  // range.
  Player.prototype.checkIntercept = function(ball) {
    if (this.exclude) {
      // This player should not intercept the ball. Return a high
      // value to ensure this. 
      return 10000;
    }
    var d2 = Math.pow(this.p_x - ball.b_x, 2) + Math.pow(this.p_y - ball.b_y, 2);
    return d2 - Math.pow(this.p_d, 2);	
  }

  // Draw a line from the player to the ball.
  Player.prototype.drawIntercept = function(ctx, ball) {
    ctx.moveTo(this.p_x * 5, this.p_y * 5);
    ctx.lineTo(ball.b_x * 5, ball.b_y * 5);
    ctx.stroke();
  }

  Team = function(color) {
    this.t_color = color;
    this.players = new Array();	
  }

  Team.prototype.addPlayer = function(x, y) {
    this.players[this.players.length] = new Player(x, y, this.t_color);
  }

  Team.prototype.addKicker = function(x, y) {
	var kicker = new Player(x, y, this.t_color);
	kicker.kicking = true;
	this.players[this.players.length] = kicker;
  }

  Team.prototype.drawPlayers = function(ctx) {
    for (var i = 0; i < this.players.length; i++) {
      this.players[i].draw(ctx);  
    }	
  }

  Team.prototype.resetPlayers = function() {
    for (var i = 0; i < this.players.length; i++) {
      this.players[i].reset();
    }	
  }

  Pitch = function() {
	// Anfield dimaensions.
    this.w = 68;
    this.h = 101;	
  }

  Pitch.prototype.draw = function(ctx) {
	ctx.strokeStyle = '#FFFFFF';
	// half way line
	ctx.moveTo(0, this.h * 5/2);
    ctx.lineTo(this.w * 5, this.h * 5/2);
    ctx.stroke();
    // 6 yard boxes
    var l_6 = (this.w / 2) - (7.32 / 2) - 5.5;
    var r_6 = (this.w / 2) + (7.32 / 2) + 5.5;

    ctx.moveTo(l_6 * 5, 0);
    ctx.lineTo(l_6 * 5, 5.5 * 5);
    ctx.stroke();
    ctx.lineTo(r_6 * 5, 5.5 * 5);
    ctx.stroke();
    ctx.lineTo(r_6 * 5, 0);
    ctx.stroke();

    ctx.moveTo(l_6 * 5, this.h * 5);
    ctx.lineTo(l_6 * 5, (this.h - 5.5) * 5);
    ctx.stroke();
    ctx.lineTo(r_6 * 5, (this.h - 5.5) * 5);
    ctx.stroke();
    ctx.lineTo(r_6 * 5, this.h * 5);
    ctx.stroke();

    // penalty areas
    var l_p = l_6 - 11;
    var r_p = r_6 + 11;

    ctx.moveTo(l_p * 5, 0);
    ctx.lineTo(l_p * 5, 16.5 * 5);
    ctx.stroke();
    ctx.lineTo(r_p * 5, 16.5 * 5);
    ctx.stroke();
    ctx.lineTo(r_p * 5, 0);
    ctx.stroke();

	ctx.moveTo(l_p * 5, this.h * 5);
    ctx.lineTo(l_p * 5, (this.h - 16.5) * 5);
    ctx.stroke();
    ctx.lineTo(r_p * 5, (this.h - 16.5) * 5);
    ctx.stroke();
    ctx.lineTo(r_p * 5, this.h * 5);
    ctx.stroke();

    // penalty d's
    var pen_spot_x = this.w / 2.
    var pen_spot_y = 11;
    var pen_spot_r = 9.15;
	ctx.beginPath();
    ctx.arc(pen_spot_x * 5, pen_spot_y * 5, pen_spot_r * 5, Math.PI * 0.21, Math.PI * 0.79);
    ctx.stroke();

    pen_spot_y = this.h - 11;
	ctx.beginPath();
    ctx.arc(pen_spot_x * 5, pen_spot_y * 5, pen_spot_r * 5, Math.PI * 1.21, Math.PI * 1.79);
    ctx.stroke();

    // center circle
	ctx.beginPath();
    ctx.arc(this.w * 5/2, this.h * 5/2, 9.15 * 5, 0, 2*Math.PI);
    ctx.stroke();
  }

  // A simulation consists of two teams and a ball.
  // The teams are positioned around the pitch.
  // The ball has a position and kicks of all angles and
  // speeds are modelled to see who gets possession.
  Simulation = function(context) {
    this.ctx = context;

    this.kicker_x = 38;
    this.kicker_y = 24;

    this.reds = new Team("#FF7777");
    this.reds.addPlayer(32, 4);
    this.reds.addPlayer(22, 18);
    this.reds.addPlayer(43, 17);
    this.reds.addPlayer(20, 21);
    this.reds.addPlayer(35, 23);
    this.reds.addKicker(this.kicker_x, this.kicker_y);
    this.reds.addPlayer(8, 25);
    this.reds.addPlayer(33, 41);
    this.reds.addPlayer(58, 41);
    this.reds.addPlayer(37, 55);
    this.reds.addPlayer(20, 61);

    this.blues = new Team("#7777FF")
    this.blues.addPlayer(32, 88);
    this.blues.addPlayer(25, 58);
    this.blues.addPlayer(39, 63);
    this.blues.addPlayer(7, 54);
    this.blues.addPlayer(24, 48);
    this.blues.addPlayer(45, 51);
    this.blues.addPlayer(46, 42);
    this.blues.addPlayer(18, 30);
    this.blues.addPlayer(36, 32);
    this.blues.addPlayer(40, 28);
    this.blues.addPlayer(25, 22);

    this.pitch = new Pitch();
  }

  Simulation.prototype.drawPlayers = function() {
    this.reds.drawPlayers(this.ctx);
    this.blues.drawPlayers(this.ctx);
  }

  // Convert the distance (actually distance squared) between
  // two players as the probability that a player has time to control the ball.
  // > 25 (5^2) gives probablity 0.99
  // < 0.2 gives probability 0.5
  Simulation.prototype.diffProb = function(diff) {
    if (diff < 0) diff = diff * -1;
    diff = diff - 0.2;
    if (diff >= 25) return 0.99;
    if (diff <= 0) return 0.5;
    return 0.5 + (0.5 * (diff/25));
  }

  // Return  the probability that a player is able to control
  // the ball. A player running at top speed intercepting a
  // fast moving ball has a lower proability of controlling
  // the ball.
  Simulation.prototype.controlProb = function(ball) {
	// Only take into account the ball speed.
	// Could be more sophisticated, looking at the relative
	// speed of the player and the ball, taking into account the
	// difference in direction of both.
	if (ball.b_speed < 10) return 1;
	if (ball.b_speed > 50) return 0;
	return 1 - (ball.b_speed / 50); 
  }

  Simulation.prototype.getShadeForProb = function(prob) {
    if (prob > 0.98) return "00";
    if (prob > 0.95) return "22"
    if (prob > 0.90) return "33";
    if (prob > 0.85) return "44";
    if (prob > 0.80) return "55";
    if (prob > 0.75) return "66";
    if (prob > 0.70) return "77";
    if (prob > 0.65) return "88";
    if (prob > 0.60) return "99";
    if (prob > 0.55) return "AA";
    if (prob > 0.52) return "BB";
    return "DD";				
  }

  Simulation.prototype.drawInterceptedBall = function(ball, r_dif, b_dif, r_player_index, b_player_index) {
    var delta = r_dif - b_dif
    // Get probability of ownership based on space available to intercepting player.
    var prob = this.diffProb(delta);
    // Adjust for difficulty in controlling the ball.
    var p_control = this.controlProb(ball);
    prob = 0.5 + ((prob - 0.5) * p_control);

    var shade = this.getShadeForProb(prob);
    if (r_dif <= b_dif) { // reds
      var color = "#FF" + shade + shade;
      ball.draw(this.ctx, color);
    } else { // blues
      var color = "#" + shade + shade + "FF";
      ball.draw(this.ctx, color);
    }
    
    if (p_control < 0.7) {
      if (r_dif <= b_dif) {
        this.reds.players[r_player_index].exclude = true;
      } else {
        this.blues.players[b_player_index].exclude = true;
      }
      return false; // Simulation is not finished.
    }
    return true; // Simulation is finished.
  }


// todo - possibly assign a probability to the player controlling the ball
// drop the player out of the competition and then con tune the loop
// modeling a fast ball going through a player's legs etc..
  Simulation.prototype.findIntercept = function(ball) {
    var time_delta = 0.1;
    // Loop for ten seconds of simulated time.
    for (var t = 0; t < 100; t++) {
      var min_r_diff = 10000;
      var closest_red_index = 0;
      var min_b_diff = 10000;
      var closest_blue_index = 0;
      ball.update(time_delta);
      if (!ball.onPitch()) {
	    //console.log('ball left pitch at ' + ball.b_x + ' ' + ball.b_y);
	    break;
      }
      var intercepted = false;
      // Update the reds.
      for (var i = 0; i < this.reds.players.length; i++) {
        this.reds.players[i].update(time_delta);
        var r_diff = this.reds.players[i].checkIntercept(ball);
        if (r_diff < min_r_diff) { 
          min_r_diff = r_diff;
          closest_red_index = i; 
        }
      }
      // Update the blues.
      for (var j = 0; j < this.blues.players.length; j++) {
        this.blues.players[j].update(time_delta);
        var b_diff = this.blues.players[j].checkIntercept(ball);
        if (b_diff <= min_b_diff) {
          min_b_diff = b_diff;
          closest_blue_index = j;
        }
      }
      //console.log('t ' + t + ' min_r_diff ' + min_r_diff + ' min_b_diff ' + min_b_diff);
      if (min_r_diff <= 0 || min_b_diff <= 0) {
	    //console.log('b_x ' + ball.b_x + ' b_y ' + ball.b_y);
        var done = this.drawInterceptedBall(ball, min_r_diff, min_b_diff,
            closest_red_index, closest_blue_index);
        if (done) {
	      //console.log('done');
          break;
        } else {
          //console.log('not done');
        }
      }
    }	
  }

  Simulation.prototype.newBall = function(speed, direction) {
	// Place the ball so that it is 0.5m away from the kicker
	// in the direction of the kick. This gives the ball a chance
	// to get away rather than being immediately captured.
	var b_x = this.kicker_x + (0.5 * Math.sin(direction));
	var b_y = this.kicker_y - (0.5 * Math.cos(direction));
	return new Ball(b_x, b_y, speed, direction);
  }

  Simulation.prototype.simulateOneKick = function(speed, direction) {
	console.log('simulate one kick: speed ' + speed + ', direction ' + direction);
    this.reds.resetPlayers();
    this.blues.resetPlayers();
    this.findIntercept(this.newBall(speed, direction));
    this.drawPlayers();
  }

  Simulation.prototype.simulate = function() {
    // Loop over a range of directions
    for (var j = 0; j < 256; j++) {
      // Loop over a range of kick speeds from 0 - 20m/s
      for (var i = 0; i < 80; i++) {
        this.reds.resetPlayers();
        this.blues.resetPlayers();
        var speed = i/4;
        var direction = Math.PI * j/128;
        this.findIntercept(this.newBall(speed, direction));
      }
    }
    this.pitch.draw(this.ctx);
    this.drawPlayers();
  }
