import { IRequestUser } from "../../interfaces/requestUser.interface"
import { prisma } from "../../lib/prisma"
import { IUpdatePatientProfilePayload } from "./patient.interface"

const updateMyProfile(user: IRequestUser, payload: IUpdatePatientProfilePayload) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email,
        },
        include:{
            patientHealthData: true,
            medicalReports: true,
        }
    })

    



}
        