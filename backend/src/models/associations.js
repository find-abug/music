/**
 * 模型关联关系定义
 */
const Composer = require('./Composer');
const Conductor = require('./Conductor');
const Performer = require('./Performer');
const Orchestra = require('./Orchestra');
const Venue = require('./Venue');
const Performance = require('./Performance');
const PerformancePiece = require('./PerformancePiece');
const PerformancePerformer = require('./PerformancePerformer');

// ============ Performance 关联 ============
Performance.belongsTo(Venue, { foreignKey: 'venue_id', as: 'venue' });
Venue.hasMany(Performance, { foreignKey: 'venue_id', as: 'performances' });

Performance.belongsTo(Orchestra, { foreignKey: 'orchestra_id', as: 'orchestra' });
Orchestra.hasMany(Performance, { foreignKey: 'orchestra_id', as: 'performances' });

Performance.belongsTo(Conductor, { foreignKey: 'conductor_id', as: 'conductor' });
Conductor.hasMany(Performance, { foreignKey: 'conductor_id', as: 'performances' });

// ============ PerformancePiece 关联 ============
Performance.hasMany(PerformancePiece, { foreignKey: 'performance_id', as: 'pieces' });
PerformancePiece.belongsTo(Performance, { foreignKey: 'performance_id' });

PerformancePiece.belongsTo(Composer, { foreignKey: 'composer_id', as: 'composer' });
Composer.hasMany(PerformancePiece, { foreignKey: 'composer_id', as: 'pieces' });

// ============ PerformancePerformer 关联 ============
Performance.hasMany(PerformancePerformer, { foreignKey: 'performance_id', as: 'performancePerformers' });
PerformancePerformer.belongsTo(Performance, { foreignKey: 'performance_id' });

PerformancePerformer.belongsTo(Performer, { foreignKey: 'performer_id', as: 'performer' });
Performer.hasMany(PerformancePerformer, { foreignKey: 'performer_id' });

// ============ Performance <-> Performer 多对多 ============
Performance.belongsToMany(Performer, {
  through: PerformancePerformer,
  foreignKey: 'performance_id',
  otherKey: 'performer_id',
  as: 'performers',
});
Performer.belongsToMany(Performance, {
  through: PerformancePerformer,
  foreignKey: 'performer_id',
  otherKey: 'performance_id',
  as: 'performances',
});

module.exports = {
  Composer,
  Conductor,
  Performer,
  Orchestra,
  Venue,
  Performance,
  PerformancePiece,
  PerformancePerformer,
};
