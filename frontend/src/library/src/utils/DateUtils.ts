export class DateUtils {

    public static toIsoDate(date:Date) {
        return `${date.toISOString().split(".")[0]}Z`;
    }
}
