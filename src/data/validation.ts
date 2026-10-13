export function validateBirthDate(day:number,month:number,year:number,now=new Date()):'dateMissing'|'dateImpossible'|'dateFuture'|null{
 if(!day||!month||!year)return 'dateMissing';
 const date=new Date(0);date.setFullYear(year,month-1,day);date.setHours(0,0,0,0);
 if(!Number.isInteger(day)||!Number.isInteger(month)||!Number.isInteger(year)||year<1||date.getFullYear()!==year||date.getMonth()!==month-1||date.getDate()!==day)return 'dateImpossible';
 const today=new Date(now);today.setHours(0,0,0,0);return date>today?'dateFuture':null;
}
