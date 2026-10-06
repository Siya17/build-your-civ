// Lesson pacing is independent of the civilization's game rules and saved answers.
const fullAnswers = ['eventAnswer','geographyAnswer','governmentAnswer','economyAnswer','beliefAnswer','shapeAnswer','notChosenAnswer'];
export const lessonProfiles = {
  full: { answers:fullAnswers, reflections:true, omittedSteps:[] },
  short: {
    answers:['eventAnswer','geographyAnswer','governmentAnswer','economyAnswer'],
    reflections:false,
    omittedSteps:['land','climate','resources','shapeAnswer','notChosenAnswer','revealPlace','revealCompare','historyDifferenceAnswer','historyWorkAnswer','historyOmissionAnswer','reflectionReview','reflectionSubmit','takeaway']
  }
};
export const validLessonVersion = value => value === 'full' || value === 'short';
export const lessonProfile = value => lessonProfiles[value] ?? lessonProfiles.full;
export const shortLesson = team => team?.lessonVersion === 'short';
export const beliefExplanationRequired = (state, version) => version !== 'short' || state.beliefs === 'other';
// Fixed regions, teacher renames, and sign-ins do not count as student work.
export function lessonStarted(team) {
  const s = team.state;
  return !!(Object.entries(team.activityCounts ?? {}).some(([actor,count]) => actor !== 'Teacher' && count > 0)
    || team.submittedAt || s.tech?.length || s.civic?.length || s.event || Object.keys(s.rolls ?? {}).length
    || s.government || s.economy?.length || s.beliefs || Object.keys(s.predictions ?? {}).length
    || (s.mapPoint && !s.fixedPoint)
    || ['civName',...fullAnswers,'predictEasyNote','predictHardNote','surpriseNote','riskNote'].some(key => s[key]?.trim())
    || s.reflection?.submittedAt || Object.values(s.reflection ?? {}).some(value => typeof value === 'string' && value.trim()));
}
export const shortSchedule = [5,8,17,6,15,25,14];
