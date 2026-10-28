from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether,
    PageBreak,
)


OUTPUT = Path(__file__).resolve().parents[2] / "output" / "pdf" / "e-operation-functional-requirements.pdf"

NAVY = colors.HexColor("#183B56")
TEAL = colors.HexColor("#007C83")
PALE_TEAL = colors.HexColor("#EAF6F5")
PALE_BLUE = colors.HexColor("#EDF4F8")
TEXT = colors.HexColor("#253746")
MUTED = colors.HexColor("#5E7180")
LINE = colors.HexColor("#C9D8E1")
AMBER = colors.HexColor("#FFF3D9")
AMBER_LINE = colors.HexColor("#E5B25E")


def bullet(text, styles):
    return Paragraph(f"<bullet>&bull;</bullet>{text}", styles["bullet"])


def section_title(title, styles):
    return [Spacer(1, 5 * mm), Paragraph(title, styles["section"]), Spacer(1, 2.5 * mm)]


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.5)
    canvas.line(doc.leftMargin, 13 * mm, A4[0] - doc.rightMargin, 13 * mm)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(doc.leftMargin, 8.5 * mm, "E-Operation - Functional Requirements Overview")
    canvas.drawRightString(A4[0] - doc.rightMargin, 8.5 * mm, f"Page {doc.page}")
    canvas.restoreState()


def info_table(rows, widths):
    table = Table(rows, colWidths=widths, repeatRows=1, hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.2),
        ("LEADING", (0, 0), (-1, -1), 10.2),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.4, LINE),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, PALE_BLUE]),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return table


def main():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(OUTPUT), pagesize=A4,
        rightMargin=17 * mm, leftMargin=17 * mm, topMargin=16 * mm, bottomMargin=19 * mm,
        title="E-Operation Functional Requirements Overview",
        author="B-Connect ERP",
    )
    base = getSampleStyleSheet()
    styles = {
        "title": ParagraphStyle("Title", parent=base["Title"], fontName="Helvetica-Bold", fontSize=23,
                                leading=27, textColor=NAVY, alignment=TA_LEFT, spaceAfter=6),
        "subtitle": ParagraphStyle("Subtitle", parent=base["Normal"], fontName="Helvetica", fontSize=11,
                                   leading=15, textColor=MUTED, spaceAfter=12),
        "section": ParagraphStyle("Section", parent=base["Heading2"], fontName="Helvetica-Bold", fontSize=14,
                                  leading=17, textColor=NAVY, spaceBefore=0, spaceAfter=0),
        "subsection": ParagraphStyle("Subsection", parent=base["Heading3"], fontName="Helvetica-Bold", fontSize=10.5,
                                     leading=13, textColor=TEAL, spaceBefore=5, spaceAfter=4),
        "body": ParagraphStyle("Body", parent=base["BodyText"], fontName="Helvetica", fontSize=9.3,
                               leading=13, textColor=TEXT, spaceAfter=4),
        "bullet": ParagraphStyle("Bullet", parent=base["BodyText"], fontName="Helvetica", fontSize=9.3,
                                 leading=13, leftIndent=11, firstLineIndent=-8, textColor=TEXT, spaceAfter=2),
        "small": ParagraphStyle("Small", parent=base["BodyText"], fontName="Helvetica", fontSize=8.2,
                                leading=10.5, textColor=MUTED),
        "callout": ParagraphStyle("Callout", parent=base["BodyText"], fontName="Helvetica-Bold", fontSize=9.2,
                                  leading=13, textColor=TEXT),
        "center": ParagraphStyle("Center", parent=base["BodyText"], alignment=TA_CENTER, fontName="Helvetica-Bold",
                                  fontSize=8.5, leading=11, textColor=NAVY),
    }

    story = []
    story.append(Spacer(1, 7 * mm))
    story.append(Paragraph("E-Operation", styles["title"]))
    story.append(Paragraph("Functional Requirements Overview", styles["title"]))
    story.append(Paragraph(
        "A consolidated view of the delivered and agreed functional scope for CRM, contract operations, billing, and reporting.",
        styles["subtitle"],
    ))
    story.append(Spacer(1, 6 * mm))
    intro = Table([[Paragraph("<b>Purpose</b><br/>Provide a practical reference for what the E-Operation module currently supports and where the remaining scope begins.", styles["body"]),
                    Paragraph("<b>Operating principle</b><br/>Permissions, responsibility, and audit history follow the real operational role at every workflow stage.", styles["body"])]],
                  colWidths=[86 * mm, 86 * mm])
    intro.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PALE_TEAL),
        ("BOX", (0, 0), (-1, -1), 0.6, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(intro)

    story += section_title("1. Administration foundation", styles)
    for item in [
        "User management supports creating, editing, enabling, and disabling user accounts.",
        "Role management provides a clean permission-management page while preserving protected system roles.",
        "User-zone assignments support operational scope and the availability of technicians for installation work.",
        "Contract types and promotional offers are managed dynamically rather than being hard-coded in the application.",
        "Navigation is permission-aware through the app, module, and page model.",
    ]:
        story.append(bullet(item, styles))

    story += section_title("2. Contract and customer operations", styles)
    for item in [
        "The Add Contract journey captures customer, address, contact, tax, geographic, plan, payment, additional-service, and hardware details.",
        "Customer codes are automatic. Contact data includes mobile and Egyptian landline handling, while documents and location details are retained with the customer record.",
        "Date inputs and reports use a day/month/year presentation for operational consistency.",
        "The contract master file and follow-up views expose the expanded operational fields in a tabular format.",
        "Every important edit and workflow change is tracked in System Actions, including readable From and To state values.",
    ]:
        story.append(bullet(item, styles))

    story.append(PageBreak())
    story += section_title("3. Contract workflow", styles)
    story.append(Paragraph("The implemented responsibility chain is shown below. Stage notes are stored separately so operational context is retained with the correct stage.", styles["body"]))
    workflow_rows = [
        ["Workflow stage", "Responsible role", "Key responsibility"],
        ["Under Checking", "Call Center", "Review contract, add notes, and edit customer information."],
        ["Pending", "Operational Manager", "Approve or reject the contract; rejection requires a reason; customer information can be edited."],
        ["Under Installation", "Technical Support Manager", "Assign or reassign a zone-eligible technical representative for installation."],
        ["Installed", "Assigned Technical Representative", "Complete installation and enter the manual activation code."],
        ["Activated", "Call Center", "Confirm activation and close the operational workflow."],
    ]
    story.append(info_table([[Paragraph(cell, styles["small"]) for cell in row] for row in workflow_rows], [36 * mm, 42 * mm, 94 * mm]))
    story.append(Spacer(1, 4 * mm))
    flow = Table([[Paragraph("UNDER CHECKING", styles["center"]), Paragraph("PENDING", styles["center"]), Paragraph("UNDER INSTALLATION", styles["center"]), Paragraph("INSTALLED", styles["center"]), Paragraph("ACTIVATED", styles["center"]) ]],
                 colWidths=[34.4 * mm] * 5)
    flow.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PALE_TEAL),
        ("BOX", (0, 0), (-1, -1), 0.6, TEAL),
        ("INNERGRID", (0, 0), (-1, -1), 0.6, TEAL),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(flow)
    story.append(Spacer(1, 3 * mm))
    story.append(Paragraph("If activation fails, the contract returns to Under Installation. The previous technician assignment is cleared so the Technical Support Manager deliberately assigns the next installation owner.", styles["small"]))

    story += section_title("4. Additional-service requests", styles)
    for item in [
        "A requester first selects any active zone, then sees the contracts in that zone. Zone access is intentionally not restricted.",
        "Requests support additional units, replication, and hardware lines, plus operational notes.",
        "The Operational Manager approves or rejects the request. Rejection requires a reason.",
        "Approval creates the invoice; collection of that invoice is intentionally a later process.",
    ]:
        story.append(bullet(item, styles))

    story += section_title("5. Billing and collection safeguards", styles)
    for item in [
        "Initial contract financial records are created when the contract is created, not when it is approved.",
        "Selected subscription months are represented explicitly and validated so required month amounts are paid correctly.",
        "The payment flow defaults to the remaining amount and prevents aggregate overpayment.",
        "Additional services and replication follow their own paid service handling; hardware is invoice-only and is excluded from add-on collection validation.",
        "Payment methods, cheque details, invoices, receipts, and allocation rules are integrated with the contract flow.",
    ]:
        story.append(bullet(item, styles))

    story.append(PageBreak())
    story += section_title("6. Operational reporting", styles)
    story.append(Paragraph("The reporting surface is designed around the data captured during contract creation and execution.", styles["body"]))
    report_rows = [
        ["Report / view", "What it provides"],
        ["Contract master file", "Expanded contract, customer, address, geography, implementation, notes, and workflow data."],
        ["Contract follow-up", "Master-file-like contract table with the relevant workflow actions for the user role."],
        ["Rejected contracts", "Dedicated view of rejected contracts and their rejection context."],
        ["System Actions", "Auditable edits and status transitions shown with readable From and To values."],
        ["Operational sales and collections", "Sales, collection, additional-units, replication, and related operational measures."],
        ["Targets / scoped work", "Activated contracts are visible as targets for the applicable technical-representative zones."],
    ]
    story.append(info_table([[Paragraph(cell, styles["small"]) for cell in row] for row in report_rows], [53 * mm, 119 * mm]))
    story.append(Spacer(1, 4 * mm))
    story.append(Paragraph("Reports support export where implemented and use the same date convention as the operational screens.", styles["body"]))

    story += section_title("7. Explicitly deferred scope", styles)
    deferred = Table([[Paragraph("Not yet implemented", styles["callout"]),
                       Paragraph("Refunds have been discussed as a financial-control dimension, but their workflow, authorization, accounting treatment, and user interface are not implemented yet. Collection for invoices created by the new additional-service request approval flow is also deliberately deferred.", styles["body"]) ]],
                     colWidths=[42 * mm, 130 * mm])
    deferred.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), AMBER),
        ("BOX", (0, 0), (-1, -1), 0.8, AMBER_LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(deferred)
    story.append(Spacer(1, 8 * mm))
    story.append(Paragraph("This document describes the agreed functional behavior. It is intended as an operational baseline for testing, training, and future scope decisions.", styles["small"]))

    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print(OUTPUT)


if __name__ == "__main__":
    main()
