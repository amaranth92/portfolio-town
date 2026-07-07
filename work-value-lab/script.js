const $ = (id) => document.getElementById(id);
const i18n = window.WORKCALC_I18N || {
  locale: "ko-KR",
  currency: "KRW",
  block: "블록",
  summary: "오늘은 {worked} 일했고, 회의 {meetingMinutes}분은 대략 {meetingCost}의 인건비를 씁니다.",
};
const money = new Intl.NumberFormat(i18n.locale, {
  style: "currency",
  currency: i18n.currency,
  maximumFractionDigits: 0,
});

function minutesFromTime(value) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatMinutes(minutes) {
  const safe = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safe / 60);
  const rest = safe % 60;
  if (i18n.locale === "ko-KR") return `${hours}시간 ${rest}분`;
  if (i18n.locale === "ja-JP") return `${hours}時間 ${rest}分`;
  if (i18n.locale === "zh-CN") return `${hours}小时 ${rest}分钟`;
  if (i18n.locale === "ar-SA") return `${hours} س ${rest} د`;
  if (i18n.locale === "de-DE") return `${hours} Std. ${rest} Min.`;
  return `${hours}h ${rest}m`;
}

function calculate() {
  const start = minutesFromTime($("startTime").value);
  let end = minutesFromTime($("endTime").value);
  if (end < start) end += 24 * 60;

  const breakMinutes = Number($("breakMinutes").value || 0);
  const hourlyWage = Number($("hourlyWage").value || 0);
  const people = Number($("people").value || 1);
  const meetingMinutes = Number($("meetingMinutes").value || 0);
  const focusMinutes = Number($("focusMinutes").value || 1);
  const focusGoal = Number($("focusGoal").value || 0);

  const workedMinutes = Math.max(0, end - start - breakMinutes);
  const overtimeMinutes = Math.max(0, workedMinutes - 8 * 60);
  const overtimePay = (overtimeMinutes / 60) * hourlyWage * 1.5;
  const meetingCost = people * (meetingMinutes / 60) * hourlyWage;
  const focusBlocks = Math.ceil(focusGoal / Math.max(1, focusMinutes));

  $("worked").textContent = formatMinutes(workedMinutes);
  $("overtimePay").textContent = money.format(overtimePay);
  $("meetingCost").textContent = money.format(meetingCost);
  $("focusBlocks").textContent = `${focusBlocks} ${i18n.block}`;
  $("summary").textContent = i18n.summary
    .replace("{worked}", formatMinutes(workedMinutes))
    .replace("{meetingMinutes}", meetingMinutes)
    .replace("{meetingCost}", money.format(meetingCost));
}

document.querySelectorAll("input").forEach((input) => input.addEventListener("input", calculate));
calculate();
