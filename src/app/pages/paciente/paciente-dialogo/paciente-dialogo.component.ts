import { Paciente } from './../../../_model/paciente';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { PacienteService } from 'src/app/_service/paciente.service';

@Component({
  selector: 'app-paciente-dialogo',
  templateUrl: './paciente-dialogo.component.html',
  styleUrls: ['./paciente-dialogo.component.css']
})
export class PacienteDialogoComponent implements OnInit {

  paciente: Paciente;
  operacion: string;
  formvalid:boolean=false;

  constructor(private dialogRef: MatDialogRef<PacienteDialogoComponent>, @Inject(MAT_DIALOG_DATA) private data: string, private pacienteService: PacienteService) { }

  ngOnInit() {
    this.paciente = new Paciente();
    this.paciente.nombres='';
    this.paciente.apellidos='';
    this.paciente.telefono='';
    this.paciente.dni='';
    this.paciente.direccion='';
    this.paciente.email='';
    this.operacion=this.data;
/*
    this.pacienteService.listarPorId(72).subscribe(data => {  
      this.paciente=data;
      }); */
   
  }

  cancelar() {
    this.dialogRef.close();
  }


  change(e: any){
    if(this.paciente.telefono.length === 0 || this.paciente.email.length === 0 || this.paciente.dni.length === 0 ||
      this.paciente.nombres.length === 0 || this.paciente.apellidos.length === 0 || this.paciente.direccion.length === 0) {
      this.formvalid=false;
    } else{
      this.formvalid=true;
    }
  }

  operar() {
      this.pacienteService.registrar(this.paciente).subscribe((data : Paciente) => {  
        this.pacienteService.pacienteNewCambio.next(data);
        this.pacienteService.listar().subscribe(pacientes => {
          this.pacienteService.pacienteCambio.next(pacientes);
          this.pacienteService.mensajeCambio.next("Se registro");           
        }); 
      });
    
    this.dialogRef.close();
  }

}
