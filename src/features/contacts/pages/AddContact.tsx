import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";

import {
  Phone,
  Plus,
  Trash2,
  ArrowLeft,
} from "lucide-react";

import { useNavigate } from "react-router-dom";


// ============================================================
// VALIDATION
// ============================================================

const contactSchema = z.object({
  nameEn: z
    .string()
    .min(2, "English name is required")
    .max(255),

  nameAr: z
    .string()
    .min(2, "Arabic name is required")
    .max(255),

  contactType: z.enum(["Owner", "Manager"]),

  nationalId: z
    .string()
    .max(50)
    .optional(),

  email: z
    .string()
    .email("Invalid email address")
    .max(30),

  phones: z
    .array(
      z.object({
        phoneNumber: z
          .string()
          .min(5, "Phone number is required")
          .max(30),

        phoneType: z.enum([
          "LANDLINE",
          "MOBILE",
          "WHATSAPP",
        ]),

        isPrimary: z.boolean(),
      })
    )
    .min(1, "At least one phone number is required"),
});

type ContactFormValues = z.infer<typeof contactSchema>;


// ============================================================
// PAGE
// ============================================================

export default function AddContact() {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),

    defaultValues: {
      nameEn: "",
      nameAr: "",
      contactType: "Owner",
      nationalId: "",
      email: "",

      phones: [
        {
          phoneNumber: "",
          phoneType: "MOBILE",
          isPrimary: true,
        },
      ],
    },
  });


  const {
    fields: phoneFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "phones",
  });


  const phones = watch("phones");


  // ============================================================
  // SUBMIT
  // ============================================================

  const onSubmit = async (values: ContactFormValues) => {
    try {
      setIsSubmitting(true);

      console.log("Contact:", values);

      const response = await fetch(
        "/api/v1/contacts",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(values),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create contact");
      }

      navigate("/contacts");

    } catch (error) {
      console.error(error);

    } finally {
      setIsSubmitting(false);
    }
  };


  // ============================================================
  // SET PRIMARY PHONE
  // ============================================================

  const setPrimaryPhone = (index: number) => {
    phones.forEach((_, phoneIndex) => {
      setValue(
        `phones.${phoneIndex}.isPrimary`,
        phoneIndex === index
      );
    });
  };


  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="space-y-6 p-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex items-center gap-3">

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => navigate("/contacts")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div>
          <h1 className="text-2xl font-semibold">
            Add Contact
          </h1>

          <p className="text-sm text-muted-foreground">
            Create a new contact and add their phone numbers.
          </p>
        </div>

      </div>


      {/* ======================================================
          FORM
      ====================================================== */}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >

        {/* ==================================================
            BASIC INFORMATION
        ================================================== */}

        <Card>

          <CardHeader>
            <CardTitle>
              Basic Information
            </CardTitle>
          </CardHeader>

          <CardContent className="grid gap-6 md:grid-cols-2">

            {/* NAME EN */}

            <div className="space-y-2">

              <label className="text-sm font-medium">
                English Name
              </label>

              <Input
                placeholder="Enter English name"
                {...register("nameEn")}
              />

              {errors.nameEn && (
                <p className="text-sm text-destructive">
                  {errors.nameEn.message}
                </p>
              )}

            </div>


            {/* NAME AR */}

            <div className="space-y-2">

              <label className="text-sm font-medium">
                Arabic Name
              </label>

              <Input
                dir="rtl"
                placeholder="أدخل الاسم بالعربية"
                {...register("nameAr")}
              />

              {errors.nameAr && (
                <p className="text-sm text-destructive">
                  {errors.nameAr.message}
                </p>
              )}

            </div>


            {/* CONTACT TYPE */}

            <div className="space-y-2">

              <label className="text-sm font-medium">
                Contact Type
              </label>

              <Select
                value={watch("contactType")}
                onValueChange={(value) =>
                  setValue(
                    "contactType",
                    value as "Owner" | "Manager"
                  )
                }
              >

                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>

                <SelectContent>

                  <SelectItem value="Owner">
                    Owner
                  </SelectItem>

                  <SelectItem value="Manager">
                    Manager
                  </SelectItem>

                </SelectContent>

              </Select>

              {errors.contactType && (
                <p className="text-sm text-destructive">
                  {errors.contactType.message}
                </p>
              )}

            </div>


            {/* NATIONAL ID */}

            <div className="space-y-2">

              <label className="text-sm font-medium">
                National ID
              </label>

              <Input
                placeholder="Enter national ID"
                {...register("nationalId")}
              />

              {errors.nationalId && (
                <p className="text-sm text-destructive">
                  {errors.nationalId.message}
                </p>
              )}

            </div>


            {/* EMAIL */}

            <div className="space-y-2 md:col-span-2">

              <label className="text-sm font-medium">
                Email
              </label>

              <Input
                type="email"
                placeholder="example@email.com"
                {...register("email")}
              />

              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}

            </div>

          </CardContent>

        </Card>


        {/* ==================================================
            PHONE NUMBERS
        ================================================== */}

        <Card>

          <CardHeader>

            <div className="flex items-center justify-between">

              <div>

                <CardTitle>
                  Phone Numbers
                </CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  Add one or more phone numbers for this contact.
                </p>

              </div>


              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  append({
                    phoneNumber: "",
                    phoneType: "MOBILE",
                    isPrimary: false,
                  })
                }
              >

                <Plus className="mr-2 h-4 w-4" />

                Add Phone

              </Button>

            </div>

          </CardHeader>


          <CardContent className="space-y-4">

            {phoneFields.map((phone, index) => (

              <div
                key={phone.id}
                className="rounded-lg border p-4"
              >

                <div className="grid gap-4 md:grid-cols-[1fr_180px_120px_auto]">

                  {/* PHONE NUMBER */}

                  <div className="space-y-2">

                    <label className="text-sm font-medium">
                      Phone Number
                    </label>

                    <div className="relative">

                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                      <Input
                        className="pl-9"
                        placeholder="01012345678"
                        {...register(
                          `phones.${index}.phoneNumber`
                        )}
                      />

                    </div>

                    {errors.phones?.[index]?.phoneNumber && (
                      <p className="text-sm text-destructive">
                        {
                          errors.phones[index]?.phoneNumber
                            ?.message
                        }
                      </p>
                    )}

                  </div>


                  {/* PHONE TYPE */}

                  <div className="space-y-2">

                    <label className="text-sm font-medium">
                      Type
                    </label>

                    <Select
                      value={phones[index]?.phoneType}
                      onValueChange={(value) =>
                        setValue(
                          `phones.${index}.phoneType`,
                          value as
                            | "LANDLINE"
                            | "MOBILE"
                            | "WHATSAPP"
                        )
                      }
                    >

                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>

                        <SelectItem value="MOBILE">
                          Mobile
                        </SelectItem>

                        <SelectItem value="LANDLINE">
                          Landline
                        </SelectItem>

                        <SelectItem value="WHATSAPP">
                          WhatsApp
                        </SelectItem>

                      </SelectContent>

                    </Select>

                  </div>


                  {/* PRIMARY */}

                  <div className="space-y-2">

                    <label className="text-sm font-medium">
                      Primary
                    </label>

                    <div className="flex h-10 items-center gap-2">

                      <input
                        type="checkbox"
                        checked={
                          phones[index]?.isPrimary ?? false
                        }
                        onChange={() =>
                          setPrimaryPhone(index)
                        }
                        className="h-4 w-4"
                      />

                      <span className="text-sm">
                        Primary
                      </span>

                    </div>

                  </div>


                  {/* DELETE */}

                  <div className="flex items-end">

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={phoneFields.length === 1}
                      onClick={() => remove(index)}
                    >

                      <Trash2 className="h-4 w-4 text-destructive" />

                    </Button>

                  </div>

                </div>

              </div>

            ))}


            {/* PHONE ARRAY ERROR */}

            {typeof errors.phones?.message === "string" && (
              <p className="text-sm text-destructive">
                {errors.phones.message}
              </p>
            )}

          </CardContent>

        </Card>


        {/* ==================================================
            ACTIONS
        ================================================== */}

        <div className="flex justify-end gap-3">

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/contacts")}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Creating..."
              : "Create Contact"}
          </Button>

        </div>

      </form>

    </div>
  );
}

