var bd;
var shape;
var ground;

// Units along Box2D's coordinate system to place walls
var tank1LeftPos = -1.84;
var tank1RightPos = -0.68;
var tank1BottomPos = 0.92;
var tank1TopPos = 1.6;
var tank1OpeningLeftPos = -1.3;
var tank1OpeningRightPos = -1.16;
var lowerPipeBottomPos = 0.75;
var lowerPipeBottomPos2 = lowerPipeBottomPos - 0.07;
var lowerPipeRightPos = tank1OpeningLeftPos + 1.53;
var lowerPipeTopPos = 0.81;
var upperPipeLowerPos = 1;
var upperPipeLeftPos = lowerPipeRightPos + 0.30;
var upperPipeTopPos = lowerPipeTopPos + 2.16;
var upperPipeRightPos = 0.68;
var tank2LeftPos = 0;
var tank2RightPos = 1.19;
var tank2TopPos = 3.65;

var particles;
var stirrerIsMoving = false;

function TestLiquidTimer() {
  camera.position.y = 2;
  camera.position.z = 3;
  bd = new b2BodyDef;
  ground = world.CreateBody(bd);

  shape = new b2ChainShape;
  shape.vertices.push(new b2Vec2(-2, 0));
  shape.vertices.push(new b2Vec2(2, 0));
  shape.vertices.push(new b2Vec2(2, 4));
  shape.vertices.push(new b2Vec2(-2, 4));
  shape.CreateLoop();
  ground.CreateFixtureFromShape(shape, 0.0);

  var psd = new b2ParticleSystemDef();
  psd.radius = 0.018;
  var particleSystem = world.CreateParticleSystem(psd);

  // Create particles
  shape = new b2PolygonShape;
  var particleStartPosX = (tank1LeftPos + tank1RightPos) / 2;
  shape.SetAsBoxXYCenterAngle(0.55, 0.22, new b2Vec2(particleStartPosX, 1.25), 0);
  var pd = new b2ParticleGroupDef;
  pd.color.Set(0, 0, 255, 255); // Blue
  pd.flags = b2_staticPressureParticle | b2_viscousParticle | b2_tensileParticle;
  pd.shape = shape;
  particleSystem.CreateParticleGroup(pd);

  shape = new b2PolygonShape;
  shape.SetAsBoxXYCenterAngle(0.55, 0.22, new b2Vec2(particleStartPosX, 1.25), 0);
  var pd = new b2ParticleGroupDef;
  pd.color.Set(0, 0, 255, 255); // Blue
  pd.flags = b2_staticPressureParticle | b2_viscousParticle | b2_tensileParticle;
  pd.shape = shape;
  particleSystem.CreateParticleGroup(pd);

  createPipeFluids(particleSystem);
  //particleSystem.pause();
  constructTank1Box();
  constructLowerPipe();
  constructUpperPipe();
  constructTank2Box();

  generateForceFields();
  world.particleSystems[0].startForceFields();
  // Remove outer walls
  world.DestroyBody(world.bodies[1]);

  // CreateStirrer();
}

/*
 * Generates the walls around tank 1 that keeps the liquid contained.
 */
function constructTank1Box() {
  // Draw bottom wall
  body = world.CreateBody(bd);
  shape = new b2EdgeShape;
  shape.Set(new b2Vec2(tank1LeftPos, tank1BottomPos), new b2Vec2(tank1OpeningLeftPos, tank1BottomPos));
  body.CreateFixtureFromShape(shape, 0.1);

  // Draw partition blocking access to pipe
  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(tank1OpeningLeftPos, tank1BottomPos), new b2Vec2(tank1OpeningRightPos, tank1BottomPos));
  body.CreateFixtureFromShape(shape, 0.1);

  // Continue drawing bottom wall
  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(tank1OpeningRightPos, tank1BottomPos), new b2Vec2(tank1RightPos, tank1BottomPos));
  body.CreateFixtureFromShape(shape, 0.1);

  // Draw left wall
  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(tank1LeftPos, tank1BottomPos), new b2Vec2(tank1LeftPos, tank1TopPos));
  body.CreateFixtureFromShape(shape, 0.1);

  // Draw right wall
  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(tank1RightPos, tank1BottomPos), new b2Vec2(tank1RightPos, tank1TopPos));
  body.CreateFixtureFromShape(shape, 0.1);

  // Draw top wall
  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(tank1LeftPos, tank1TopPos), new b2Vec2(tank1RightPos, tank1TopPos));
  body.CreateFixtureFromShape(shape, 0.1);
}

/*
 * Generates the walls around the bottom water pipe.
 */
function constructLowerPipe() {
  // Draw lower half of pipe
  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(tank1OpeningLeftPos, tank1BottomPos), new b2Vec2(tank1OpeningLeftPos, lowerPipeBottomPos));
  body.CreateFixtureFromShape(shape, 0.1);

  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(tank1OpeningLeftPos, lowerPipeBottomPos), new b2Vec2(tank1OpeningLeftPos + 0.05, lowerPipeBottomPos - 0.07));
  body.CreateFixtureFromShape(shape, 0.1);

  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(tank1OpeningLeftPos + 0.05, lowerPipeBottomPos2), new b2Vec2(lowerPipeRightPos, lowerPipeBottomPos2));
  body.CreateFixtureFromShape(shape, 0.1);

  // Draw upper half of pipe
  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(tank1OpeningRightPos, tank1BottomPos), new b2Vec2(tank1OpeningRightPos, lowerPipeBottomPos2 + 0.15));
  body.CreateFixtureFromShape(shape, 0.1);

  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(tank1OpeningRightPos, lowerPipeBottomPos2 + 0.15), new b2Vec2(tank1OpeningRightPos + 0.052, lowerPipeBottomPos2 + 0.13));
  body.CreateFixtureFromShape(shape, 0.1);

  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(tank1OpeningRightPos + 0.052, lowerPipeBottomPos2 + 0.13), new b2Vec2(lowerPipeRightPos + 0.25, lowerPipeTopPos));
  body.CreateFixtureFromShape(shape, 0.1);

  // Barrier blocking right-side of lower pipe
  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(lowerPipeRightPos + 0.25, lowerPipeTopPos), new b2Vec2(lowerPipeRightPos + 0.25, lowerPipeBottomPos2));
  body.CreateFixtureFromShape(shape, 0.1);

  // Blocks release valve
  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(lowerPipeRightPos, lowerPipeBottomPos2), new b2Vec2(lowerPipeRightPos + 0.15, lowerPipeBottomPos2));
  body.CreateFixtureFromShape(shape, 0.1);

  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(lowerPipeRightPos + 0.15, lowerPipeBottomPos2), new b2Vec2(lowerPipeRightPos + 0.25, lowerPipeBottomPos2));
  body.CreateFixtureFromShape(shape, 0.1);
}

/*
 * Generates the walls around the upper water pipe.
 */
function constructUpperPipe() {
  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(lowerPipeRightPos + 0.25, lowerPipeTopPos), new b2Vec2(upperPipeLeftPos, lowerPipeTopPos));
  body.CreateFixtureFromShape(shape, 0.1);

  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(upperPipeLeftPos, lowerPipeTopPos), new b2Vec2(upperPipeLeftPos, upperPipeTopPos));
  body.CreateFixtureFromShape(shape, 0.1);

  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(lowerPipeRightPos + 0.25, lowerPipeBottomPos2), new b2Vec2(upperPipeRightPos, lowerPipeBottomPos2));
  body.CreateFixtureFromShape(shape, 0.1);

  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(upperPipeRightPos, lowerPipeBottomPos2), new b2Vec2(upperPipeRightPos, upperPipeTopPos));
  body.CreateFixtureFromShape(shape, 0.1);
}

/*
 * Generates the walls around tank 2 that keeps the liquid contained.
 */
function constructTank2Box() {
  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(tank2LeftPos, upperPipeTopPos), new b2Vec2(upperPipeLeftPos, upperPipeTopPos));
  body.CreateFixtureFromShape(shape, 0.1);

  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(upperPipeRightPos, upperPipeTopPos), new b2Vec2(tank2RightPos, upperPipeTopPos));
  body.CreateFixtureFromShape(shape, 0.1);

  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(tank2LeftPos, upperPipeTopPos), new b2Vec2(tank2LeftPos, tank2TopPos));
  body.CreateFixtureFromShape(shape, 0.1);

  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(tank2LeftPos, tank2TopPos), new b2Vec2(tank2RightPos, tank2TopPos));
  body.CreateFixtureFromShape(shape, 0.1);

  body = world.CreateBody(bd);
  // shape = new b2EdgeShape;
  shape.Set(new b2Vec2(tank2RightPos, upperPipeTopPos), new b2Vec2(tank2RightPos, tank2TopPos));
  body.CreateFixtureFromShape(shape, 0.1);
}

function generateForceFields(){
  world.particleSystems[0].initializeForceFieldArray();
  // Create forcefield for short vertical pipe coming from tank 1
  world.particleSystems[0].createForceField(tank1OpeningLeftPos, tank1OpeningRightPos, lowerPipeTopPos, tank1BottomPos, 0, -0.1);
  // Create forcefield for horizontal pipe
  world.particleSystems[0].createForceField(tank1OpeningLeftPos, upperPipeRightPos, lowerPipeBottomPos2, lowerPipeTopPos, 0.1, 0);
  // Create forcefield for long vertical connecting to tank 2
  world.particleSystems[0].createForceField(upperPipeLeftPos, upperPipeRightPos, lowerPipeBottomPos2, upperPipeTopPos, 0, 0.1);
  };

function createPipeFluids(particleSystem){
  // Create particles
  // Create forcefield for short vertical pipe coming from tank 1
  //tank1OpeningLeftPos, tank1OpeningRightPos, lowerPipeTopPos, tank1BottomPos, 0, -0.1

  // Fluid in vertical pipe between tank1 and horizontal pipe
  var shape = new b2PolygonShape;
  var particleCenterPosX = (tank1OpeningRightPos + tank1OpeningLeftPos) / 2; // The center of the pipe X pos
  var particleCenterPosY = (tank1BottomPos + lowerPipeTopPos) / 2; // The center of the pipe Y pos
  var dx = (tank1OpeningRightPos - tank1OpeningLeftPos)/2; // pipe width
  var dy = (tank1BottomPos - lowerPipeTopPos)/2; // pipe length (vertical)
  shape.SetAsBoxXYCenterAngle(dx, dy, new b2Vec2(particleCenterPosX, particleCenterPosY), 0);
  var pd = new b2ParticleGroupDef;
  pd.color.Set(0, 204, 255, 255); // Purple
  pd.flags = b2_staticPressureParticle | b2_viscousParticle | b2_tensileParticle;
  pd.shape = shape;
  particleSystem.CreateParticleGroup(pd);

  // Fluid in horizontal pipe
  shape = new b2PolygonShape;
  particleCenterPosX = (upperPipeRightPos + tank1OpeningLeftPos) / 2; // The center of the pipe X pos
  particleCenterPosY = (lowerPipeTopPos + lowerPipeBottomPos2) / 2; // The center of the pipe Y pos
  dx = (upperPipeRightPos - tank1OpeningLeftPos)/2; // pipe width
  dy = (lowerPipeTopPos - lowerPipeBottomPos2)/2; // pipe length (vertical)
  shape.SetAsBoxXYCenterAngle(dx, dy, new b2Vec2(particleCenterPosX, particleCenterPosY), 0);
  pd = new b2ParticleGroupDef;
  pd.color.Set(255, 0, 255, 255); // Purple
  pd.flags = b2_staticPressureParticle | b2_viscousParticle | b2_tensileParticle;
  pd.shape = shape;
  particleSystem.CreateParticleGroup(pd);

  // Fluid in vertical pipe connecting horizontal pipe and tank2
  shape = new b2PolygonShape;
  particleCenterPosX = (upperPipeRightPos + upperPipeLeftPos) / 2;
  particleCenterPosY = (upperPipeTopPos + lowerPipeBottomPos2) / 2;
  dx = (upperPipeRightPos - upperPipeLeftPos) / 2;
  dy = (upperPipeTopPos - lowerPipeBottomPos) / 2;
  shape.SetAsBoxXYCenterAngle(dx, dy, new b2Vec2(particleCenterPosX, particleCenterPosY), 0);
  pd = new b2ParticleGroupDef;
  pd.color.Set(120, 0, 120, 255); // Dark Purple
  pd.flags = b2_staticPressureParticle | b2_viscousParticle | b2_tensileParticle;
  pd.shape = shape;
  particleSystem.CreateParticleGroup(pd);
}

function destroyForceFields(){
  world.particleSystems[0].initializeForceFieldArray();
}

function invertForceFields(forceFields){
  for (ff of forceFields){
    ff.fx = ff.fx*-1;
    ff.fy = ff.fy*-1;
  }
}

function disableForceFields(forceFields){
  for (ff of forceFields){
    ff.disable();
  }
}
function enableForceFields(forceFields){
  for (ff of forceFields){
    ff.enable();
  }
}

/*
 * Removes the barrier blocking the pipe leading from tank 1 in order to allow
 * the fluid to flow out.
 */
function openTank1() {
  world.DestroyBody(world.bodies[3]);
}

/*
 * Removes the barrier blocking the pipe leading from the lower pipe into the
 * pump in order to allow the fluid to flow into the upper pipe.
 */
function openLowerPipe() {
  world.DestroyBody(world.bodies[14]);
}

function openDrainValve(){
  world.DestroyBody(world.bodies[15]); // TODO: Fix magic numbers and properly identify correct body for valve
}

function moveStirrer() {
  // Magnitude of the force applied to the body.
  var k_forceMagnitude = 10.0;
  // How often the force vector rotates.
  var k_forceOscillationPerSecond = 0.2;
  var k_forceOscillationPeriod = 1.0 / k_forceOscillationPerSecond;
  // Maximum speed of the body.
  var k_maxSpeed = 2.0;

  oscillationOffset += (1.0 / 60.0);
  if (oscillationOffset > k_forceOscillationPeriod) {
    oscillationOffset -= k_forceOscillationPeriod;
  }

  // Calculate the force vector.
  var forceVector = new b2Vec2(0, -0.1);
  b2Vec2.MulScalar(forceVector, forceVector, k_forceMagnitude);
  stirrer.ApplyForceToCenter(forceVector, true);
}
