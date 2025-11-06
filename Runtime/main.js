var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleSupplier = require('role.supplier');

module.exports.loop = function () {

    var tower = Game.getObjectById('TOWER_ID');
    if(tower) {
        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if(closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }

        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        }
    }
    
     for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    //console.log('Harvesters: ' + harvesters.length);
    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    var repairers = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer');
    var suppliers = _.filter(Game.creeps, (creep) => creep.memory.role == 'supplier');

    if(harvesters.length < 1 && !Game.spawns['Spawn1'].spawning) {
        var newName = 'Harvester' + Game.time;
        console.log('Spawning new harvester: ' + newName);
        // early harvester to bootstrap energy collection
        Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName,
            {memory: {role: 'harvester'}});
        //stronger harvester without storage for use with energy storage structures
        //Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,CARRY,MOVE], bigHarvester,
        //    {memory: {role: 'harvester'}});
    }
    
    if(builders.length < 2 && !Game.spawns['Spawn1'].spawning) {
        var newName = 'Builder' + Game.time;
        console.log('Spawning new builder: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,WORK,CARRY,MOVE], newName,
            {memory: {role: 'builder'}});
    }
    
    if(upgraders.length < 3 && !Game.spawns['Spawn1'].spawning) {
        var newName = 'Upgrader' + Game.time;
        console.log('Spawning new upgrader: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName,
            {memory: {role: 'upgrader'}});
    }
    
    
    if(repairers.length < 1 && !Game.spawns['Spawn1'].spawning && Game.spawns['Spawn1'].store.getUsedCapacity(RESOURCE_ENERGY) > 300) {
        var newName = 'Repairer' + Game.time;
        console.log('Spawning new upgrader: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName,
            {memory: {role: 'repairer'}});
    }

    if(suppliers.length < 1 && !Game.spawns['Spawn1'].spawning && Game.spawns['Spawn1'].room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_CONTAINER ||
                structure.structureType == STRUCTURE_STORAGE)}}).length > 0) {
        var newName = 'Supplier' + Game.time;
        console.log('Spawning new supplier: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([CARRY,CARRY,MOVE,MOVE], newName,
            {memory: {role: 'supplier'}});
    }

    if(Game.spawns['Spawn1'].spawning) {
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1,
            Game.spawns['Spawn1'].pos.y,
            {align: 'left', opacity: 0.8});
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
        if(creep.memory.role == 'repairer') {
            roleRepairer.run(creep);
        }
        if(creep.memory.role == 'supplier') {
            roleSupplier.run(creep);
        }
    }
}