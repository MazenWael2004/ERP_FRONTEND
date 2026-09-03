import { z } from "zod";

export const createPricingSchema = z.object({
    nameEn: z
        .string()
        .min(1, "PRICING_NAME_EN_REQUIRED")
        .regex(/^[A-Za-z\s]+$/, "PRICING_NAME_ONLY_ENGLISH"),

    nameAr: z
        .string()
        .min(1, "PRICING_NAME_AR_REQUIRED")
        .regex(/^[\u0600-\u06FF\s]+$/, "PRICING_NAME_ONLY_ARABIC"),

    code: z
    .string()
    .min(1, "PRICING_CODE_REQUIRED"),

    programId: z.number('PROGRAM_ID_REQUIRED').int().positive(),

    downPayment: z
        .number({
            error: "DOWN_PAYMENT_REQUIRED",
        })
        .min(0, "DOWN_PAYMENT_INVALID"),

    numberOfMonthsPaidAdvance: z
        .number({
            error: "NUMBER_OF_MONTHS_PAID_ADVANCE_REQUIRED",
        })
        .int("NUMBER_OF_MONTHS_PAID_ADVANCE_MUST_BE_INTEGER")
        .min(0, "NUMBER_OF_MONTHS_PAID_ADVANCE_INVALID"),

    periods: z
        .array(
            z.object({
                fromMonth: z
                    .number({
                        error: "FROM_MONTH_REQUIRED",
                    })
                    .int("FROM_MONTH_MUST_BE_INTEGER")
                    .min(1, "FROM_MONTH_INVALID"),

                toMonth: z
                    .number({
                        error: "TO_MONTH_REQUIRED",
                    })
                    .int("TO_MONTH_MUST_BE_INTEGER")
                    .min(1, "TO_MONTH_INVALID"),

                price: z
                    .number({
                        error: "PRICE_REQUIRED",
                    })
                    .min(0, "PRICE_INVALID"),
            })
        )
        .min(1, "AT_LEAST_ONE_PERIOD_REQUIRED"),
});